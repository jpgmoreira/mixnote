import path from 'path';
import { DATA_DIR } from '@main/constants';
import { genHash } from '@common/utils/utils';
import { Note } from '@common/schemas/note';
import { ensureDirExists } from '@main/utils/utils';
import fs from 'fs';

/**
 * Singleton for managing note images.
 * Access via NotesImgManager.instance
 */
export class NotesImgManager {
  static #instance: NotesImgManager;

  private constructor() {}

  private profileId: string | null = null;

  public static get instance(): NotesImgManager {
    if (!this.#instance) {
      this.#instance = new NotesImgManager();
    }
    return this.#instance;
  }

  public loadProfile(profileId: string) {
    this.profileId = profileId;
  }

  private saveBuffer(buffer: Buffer, hash: string, noteId: string) {
    const dirPath = path.join(DATA_DIR, 'profileData', this.profileId!, 'notes', noteId, 'media');
    ensureDirExists(dirPath);
    const fPath = path.join(dirPath, `${noteId}_${hash}.png`);
    fs.writeFileSync(fPath, buffer);
  }

  private saveBase64src(src: string, hash: string, noteId: string) {
    const base64 = src.slice(src.indexOf(';base64,') + ';base64,'.length);
    const buffer = Buffer.from(base64, 'base64');
    this.saveBuffer(buffer, hash, noteId);
  }

  private async saveHttpSrc(src: string, hash: string, noteId: string) {
    const response = await fetch(src);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    this.saveBuffer(buffer, hash, noteId);
  }

  private isSafeFile(src: string) {
    return src.startsWith('safe-file');
  }
  private isBase64(src: string) {
    return src.startsWith('data:image');
  }
  private isHttp(src: string) {
    return src.startsWith('http');
  }

  private saveImage(src: string, hash: string, noteId: string) {
    if (this.isSafeFile(src)) {
      // Do nothing, image already saved.
    } else if (this.isBase64(src)) {
      this.saveBase64src(src, hash, noteId);
    } else if (this.isHttp(src)) {
      this.saveHttpSrc(src, hash, noteId);
    }
  }

  private imageAlreadySaved(src: string, hash: string, noteId: string) {
    if (this.isSafeFile(src)) {
      return true;
    }
    const dirPath = path.join(DATA_DIR, 'profileData', this.profileId!, 'notes', noteId, 'media');
    const fPath = path.join(dirPath, `${noteId}_${hash}.png`);
    if (fs.existsSync(fPath)) {
      return true;
    }
    return false;
  }

  private normalizeBase64src(src: string) {
    if (this.isBase64(src)) {
      return src.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
    }
    return src;
  }

  public setNoteImagesAsSafeFile(note: Note) {
    let result = note.body;
    const hashPrefix = 'hash://';
    const mediaDir = path.join(DATA_DIR, 'profileData', this.profileId!, 'notes', note.id, 'media');
    // 1. <img src="..."> or <img src='...'>
    result = result.replace(
      /<img\b[^>]*?\bsrc\s*=\s*(['"])(.*?)\1[^>]*?>/gi,
      (fullMatch, _, src) => {
        let newSrc = src;
        if (src.startsWith(hashPrefix)) {
          const hash = src.replace(hashPrefix, '');
          newSrc = path.join(mediaDir, `${note.id}_${hash}.png`);
          newSrc = `safe-file://${newSrc}`;
        }
        return fullMatch.replace(src, newSrc);
      }
    );
    // 2. Markdown image: ![alt](src)
    result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
      let newSrc = src;
      if (src.startsWith(hashPrefix)) {
        const hash = src.replace(hashPrefix, '');
        newSrc = path.join(mediaDir, `${note.id}_${hash}.png`);
        newSrc = `safe-file://${newSrc}`;
      }
      return `![${alt}](${newSrc})`;
    });
    note.body = result;
  }

  private extractHashFromSafeFile(src: string): string {
    const name = path.parse(src).name;
    const hash = name.split('_').at(-1)!;
    return hash;
  }

  public setNoteImagesAsHash(note: Note) {
    let result = note.body;
    const hashes = new Set<string>();
    // 1. <img src="..."> or <img src='...'>
    result = result.replace(
      /<img\b[^>]*?\bsrc\s*=\s*(['"])(.*?)\1[^>]*?>/gi,
      (fullMatch, _, src) => {
        let hash = '';
        if (this.isSafeFile(src)) {
          hash = this.extractHashFromSafeFile(src);
        } else if (this.isBase64(src)) {
          const normalized = this.normalizeBase64src(src);
          hash = genHash(normalized);
        } else {
          hash = genHash(src);
        }
        const newSrc = `hash://${hash}`;
        if (!hashes.has(hash) && !this.imageAlreadySaved(src, hash, note.id)) {
          this.saveImage(src, hash, note.id);
        }
        hashes.add(hash);
        return fullMatch.replace(src, newSrc);
      }
    );
    // 2. Markdown image: ![alt](src)
    result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
      let hash = '';
      if (this.isSafeFile(src)) {
        hash = this.extractHashFromSafeFile(src);
      } else if (this.isBase64(src)) {
        const normalized = this.normalizeBase64src(src);
        hash = genHash(normalized);
      } else {
        hash = genHash(src);
      }
      const newSrc = `hash://${hash}`;
      if (!hashes.has(hash) && !this.imageAlreadySaved(src, hash, note.id)) {
        this.saveImage(src, hash, note.id);
      }
      hashes.add(hash);
      return `![${alt}](${newSrc})`;
    });
    note.body = result;
  }

  public clear() {
    this.profileId = null;
  }
}

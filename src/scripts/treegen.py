import json
import random
import string
from typing import Dict, Any


def gen_id() -> str:
    return "".join(random.choices(string.ascii_letters + string.digits, k=8))


def create_file(node_id, text, depth, parent_id, position):
    return {
        "id": node_id,
        "type": "file",
        "text": text,
        "depth": depth,
        "selected": False,
        "hidden": False,
        "parentId": parent_id,
        "nextId": None,
        "prevId": None,
        "noteId": gen_id(),
        "ui": {"position": position, "isLastChild": False, "depths": depth},
    }


def create_dir(node_id, text, depth, parent_id, position):
    return {
        "id": node_id,
        "type": "dir",
        "text": text,
        "depth": depth,
        "open": True,
        "selected": False,
        "hidden": False,
        "parentId": parent_id,
        "nextId": None,
        "prevId": None,
        "dirs": {"headId": None, "tailId": None},
        "files": {"headId": None, "tailId": None},
        "nDesc": 0,
        "nSelDesc": 0,
        "nFileDesc": 0,
        "ui": {"position": position, "isLastChild": False, "depths": depth},
    }


def main():
    n = int(input("🌳 How many nodes? "))

    id_to_node: Dict[str, Any] = {}

    root = {
        "nextDir": 0,
        "nextFile": 0,
        "dirs": {"headId": None, "tailId": None},
        "files": {"headId": None, "tailId": None},
    }

    parent_stack = [None]
    last_file_in_parent = {}

    for i in range(n):
        node_id = gen_id()
        depth = random.randint(0, min(3, i))
        parent_id = parent_stack[depth] if depth < len(parent_stack) else None

        if random.random() < 0.3:
            node = create_dir(node_id, f"Folder {i}", depth, parent_id, i)
            parent_stack = parent_stack[: depth + 1]
            parent_stack.append(node_id)
            root["nextDir"] += 1
        else:
            node = create_file(node_id, f"Note {i}", depth, parent_id, i)
            root["nextFile"] += 1

        key = parent_id or "root"
        prev = last_file_in_parent.get(key)

        if prev:
            id_to_node[prev]["nextId"] = node_id
            node["prevId"] = prev
        last_file_in_parent[key] = node_id

        id_to_node[node_id] = node

        if parent_id is None:
            if node["type"] == "dir":
                root["dirs"]["headId"] = root["dirs"]["headId"] or node_id
                root["dirs"]["tailId"] = node_id
            else:
                root["files"]["headId"] = root["files"]["headId"] or node_id
                root["files"]["tailId"] = node_id

    tree = {"root": root, "idToNode": id_to_node}

    with open("tree.json", "w", encoding="utf-8") as f:
        json.dump(tree, f, indent=2, ensure_ascii=False)

    print("\n🌳 Tree successfully generated!")
    print("📄 File created: tree.json")


if __name__ == "__main__":
    main()

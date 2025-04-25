#!/usr/bin/env python3
from pathlib import Path


def extract_unicode_chars_from_files(folder):
    chars = set()
    for file in Path(folder).rglob("*.org"):
        with open(file, encoding="utf-8") as f:
            for line in f:
                chars.update(line)
    return chars


def unicode_ranges(char_set):
    codepoints = sorted(ord(c) for c in char_set)
    ranges = []
    start = end = codepoints[0]

    for cp in codepoints[1:]:
        if cp == end + 1:
            end = cp
        else:
            ranges.append((start, end))
            start = end = cp
    ranges.append((start, end))
    return ranges


def format_as_css_unicode_range(ranges):
    return "\n".join(
        f"U+{start:04X}-{end:04X}" if start != end else f"U+{start:04X}"
        for start, end in ranges
    )


folder_path = "posts/"
chars = extract_unicode_chars_from_files(folder_path)
ranges = unicode_ranges(chars)
css_range = format_as_css_unicode_range(ranges)

with open("unicode-range.txt", "w", encoding="utf-8") as f:
    f.write(css_range + "\n")

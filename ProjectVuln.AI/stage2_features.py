import re

DANGEROUS_APIS = [
    "strcpy","strcat","sprintf","gets","scanf",
    "memcpy","memmove","malloc","free"
]

def clean_code(code: str):
    code = re.sub(r"//.*", "", code)
    code = re.sub(r"/\*.*?\*/", "", code, flags=re.DOTALL)
    code = re.sub(r"\s+", " ", code).strip()
    return code

def extract_features(code: str):
    code = clean_code(code)

    features = {}
    for api in DANGEROUS_APIS:
        features[f"api_{api}"] = code.count(api)

    features.update({
        "uses_malloc": int("malloc" in code),
        "uses_free": int("free" in code),
        "malloc_count": code.count("malloc"),
        "free_count": code.count("free"),
        "ptr_star": code.count("*"),
        "ptr_amp": code.count("&"),
        "ptr_arrow": code.count("->"),
        "code_length": len(code),
        "num_statements": code.count(";"),
        "num_lines": code.count("\n") + 1
    })

    return list(features.values())

import csv
import json
from sys import argv
import os

import matplotlib.pyplot as plt
import numpy as np
import tikzplotlib
from dotenv import load_dotenv

load_dotenv()
stats_dir = os.getenv("OBF_ANALYSER_REPO_STORAGE")


def read_data(config):
    original = 0
    complexities = {}
    profiles = config["profiles"]

    repo_dir = os.path.join(stats_dir, config["repo"])
    first_dir = profiles[0]

    with open(f"{repo_dir}/{first_dir}/stats/complexities/original.json") as f:
        original_comp = json.load(f)
        original = original_comp[prop_name]

    for profile in profiles:

        profile_dir = os.path.join(repo_dir, profile)

        complexities_dir = os.path.join(profile_dir, "stats", "complexities")
        complexities[profile] = {}
        with open(f"{complexities_dir}/obfuscated.json") as f:
            obf_comp = json.load(f)
            complexities[profile]["obfuscated"] = obf_comp[prop_name] / original

        with open(f"{complexities_dir}/deobfuscated.json") as f:
            deobf_comp = json.load(f)
            complexities[profile]["deobfuscated"] = deobf_comp[prop_name] / original
    return {"original": 1, "obf": complexities}


def generate_graph(data, filename, prop_name):
    X = np.arange(len(data["obf"]))
    bar_width = 0.25
    plot_width = "\\textwidth"
    plot_height = "6cm"

    profiles = []
    scores = [[], []]
    for key in data["obf"]:
        profiles.append(key)
        scores[0].append(data["obf"][key]["obfuscated"])
        scores[1].append(data["obf"][key]["deobfuscated"])

    plt.axhline(y=data["original"], linestyle="--", linewidth=1, label="Original")
    plt.bar(X + 0.00, scores[0], color="r", width=bar_width, label="Obfuscated")
    plt.bar(X + bar_width, scores[1], color="b", width=bar_width, label="Deobfuscated")

    plt.ylabel = prop_name

    plt.xticks(X + bar_width / 2, profiles)
    plt.legend(loc="best")

    tikzplotlib.save(f"{filename}.tex", axis_width=plot_width, axis_height=plot_height)


if __name__ == "__main__":
    with open(argv[1]) as f:
        config = json.load(f)

    repo_name = config["repo"]
    prop_name = config["prop"]
    data = read_data(config)
    generate_graph(data, f"{prop_name}_{repo_name}", prop_name)

    exit()

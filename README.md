# Obfuscation analysis

Obfuscate JavaScript and analyse how various complexity metrics are affected by different obfuscation methods. Developed as part of the project for the course TDA602 - Language Based Security.

## Project status

This project is in an early development stage, with many features lacking or in an unstable state. If you encounter any problems, please check the issues and open a new one if there is no issue available to match your problem.

## Setup

### Prerequisites

The app runs on node.js, which means you need a working node setup. Currently, the code has been tested on node v17.7.1 with npm 8.5.2.

### Installation procedure

1. Change directory to the root of the project: `cd /path/to/your/directory`.
2. Install the node modules: `npm install`.
3. Create your own `.env`: `cp .env.example .env`
4. Change the `OBF_ANALYSER_REPO_STORAGE` variable in `.env` to a path which will be used to store downloaded repositories and obfuscated code.
5. See the separate section about graph generation for instructions on how to get a working Python setup in order to generate tikz-plots for your report.

### Running the app

Run `npm start` to compile the Typescript and run the output Javascript.

The app uses json config files to save obfuscation profiles and repository information. Check out the existing configs in `config/obfuscation-profiles` and `config/repos` for examples. The obfuscation profiles should follow the format from [javascript-obfuscator](https://github.com/javascript-obfuscator/javascript-obfuscator#javascript-obfuscator-options).


## Generating graphs

In the `scripts` folder, there is a Python script to generate bar charts, as tikz-figures, visualising how a certain metric changes for a repo under various obfuscation methods.

### Prerequisites

The graph generator has some Python dependencies, all available through PyPI. The recommended installation process is through a virtual environment which reduces the prerequisites to the following.

- A working Python 3 setup.
- A working setup of the `venv` module in Python 3.

### Installation

The following process assumes you are running a Bash terminal, but a similar process should work in other shells as well. Following the steps will create a virtual environment and install all dependencies.

1. Change directory to the root of project: `cd /path/to/your/directory/`.
2. Create the virtual environment: `python3 -m venv venv`.
3. Activate the virtual environment: `source venv/bin/acttivate`. If you wish to confirm the activation, running `which pip` should return something like `/path/to/your/directory/venv/bin/pip`.
4. Install the dependencies: `pip install -r requirements.txt`

Congratulations! You are ready to generate graphs for your LaTeX documents.

### Generating the graphs

To generate a graph, you need a config, stored as a json-file. There are samples available in the folder `config/graph_generator`. The config must contain the following properties.

- `"repo": string` - name of a repository, e.g. `commander`
- `"profiles": Array<string>` - Array of strings, each string being the name of an obfuscation profile, e.g. `["all","dead-code","default",]`.
- `"prop": string` - name of a property in the output from `escomplex`, e.g. `effort`. If you are unsure which fields are available, please check the generated statistics output, or check the [escomplex](https://github.com/escomplex/escomplex) README.

Once you have a profile, run the generator with `python scripts/graphmaker_auto.py /path/to/config /path/to/output/dir`. The program will generate a tikz-graph and save it as `prop_repo.tex` in `/path/to/output/dir`.
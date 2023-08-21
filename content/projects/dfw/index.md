+++
title = "DFW - Docker Firewall Framework"

[taxonomies]
categories = [
    "software",
]
tags = [
    "cli",
    "docker",
    "firewall",
    "rust",
]

[extra]
repo_path = "pitkley/dfw"
+++

Make firewall administration with Docker simpler.

<!-- more -->

DFW ([GitHub][github-dfw]) is conceptually based on the [Docker Firewall Framework, DFWFW][github-dfwfw].
Its goal is to make firewall administration with Docker simpler, but also more extensive by trying to replace the Docker built-in firewall handling.

This is accomplished by a flexible configuration that defines how the firewall should be built up.
For example, if you have some application running in the Docker container `example_app_1` which is reachable on port 80 that you want to expose on the host on port 80, the following configuration could be used:

```toml
[wider_world_to_container]
[[wider_world_to_container.rules]]
network = "example_default"
dst_container = "example_app_1"
expose_port = 80
```

You can find [more example configurations in the GitHub repository][github-dfw-examples], and more details about DFW in general can be found [in the project's README on GitHub][github-dfw-readme].

[github-dfw]: https://github.com/pitkley/dfw
[github-dfw-examples]: https://github.com/pitkley/dfw/tree/main/examples
[github-dfw-readme]: https://github.com/pitkley/dfw#readme
[github-dfwfw]: https://github.com/irsl/dfwfw

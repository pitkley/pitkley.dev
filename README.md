# pitkley.dev

## Pulling upstream changes into the vendored theme

This repository vendors the Zola theme [papaya](https://github.com/justint/papaya), as a git subtree.
It was initially added using this command, executed from the root of the repository:

```shell
git subtree add --prefix themes/papaya https://github.com/justint/papaya.git main --squash
```

If future changes should be pulled, the following command can be used:

```shell
git subtree pull --prefix themes/papaya https://github.com/justint/papaya.git main --squash
```

The advantages of vendoring the theme using git subtrees include being able to modify the theme without maintaining a fork while still being able to pull upstream changes, all while not having to fiddle around with git submodules (which also makes the initial project checkout and build easier).

<sup>
## <a name="license"></a> License

All blog content in the `content/` folder, excluding code snippets, is licensed under the Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0) license ([LICENSE-CC-BY-SA-4.0](LICENSE-CC-BY-SA-4.0)).
The remainder of the repository, including the code snippets in the `content/` folder, are licensed under the MIT license ([LICENSE-MIT](LICENSE-MIT)).

### <a name="license-contribution"></a> Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion by you, shall be licensed as indicated above, without any additional terms or conditions.
</sup>


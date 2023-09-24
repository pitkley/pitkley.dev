+++
title = "Convert .tmLanguage or Atom CSON grammar to .sublime-syntax file"
+++

I needed to convert an Atom CSON grammar to a Sublime Text `.sublime-syntax` file.
The process turned out more complicated than I expected, boiling down to these steps on my first go:

1. Convert `.cson` to `.json`.
1. Convert `.json` to `.yaml`.
1. Convert `.yaml` to `.tmLanguage` using <https://github.com/jtojnar/relaxdiego-sublime-tools>.
1. Fix the XML processing instruction in the generated `.tmLanguage` to use double quotes instead of single quotes.
1. Convert the `.tmLanguage` to `.sublime-syntax` using <https://github.com/aziz/SublimeSyntaxConvertor>.

Since this was fairly tedious, this article provides a simpler way to do all of this in one go, regardless of if your source-file is an Atom CSON grammar or a `.tmLanguage` file.

Just paste your Atom CSON or `.tmLanguage` document into the box below and the `.sublime-syntax` file will be generated for you.

<sup>_(The conversion is happening entirely client-side, no requests to any external servers are made.)_</sup>

<textarea
    class="code"
    id="convert-input"
    placeholder="Paste your Atom CSON or .tmLanguage here">
</textarea>
<textarea
    class="code code-output"
    id="convert-output"
    placeholder="...the output will show up here..."
    readonly>
</textarea>


<script src="/atom-grammar-to-sublime-syntax/cson.js" type="module"></script>
<script src="/atom-grammar-to-sublime-syntax/index.js" type="module"></script>

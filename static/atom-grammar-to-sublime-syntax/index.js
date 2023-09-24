import { SublimeSyntaxConvertor } from "/atom-grammar-to-sublime-syntax/sublimeSyntaxConvertor.js";

function convertInput(input) {
    let parsedInput;
    try {
        parsedInput = JSON.parse(input);
    } catch (_) {
        try {
            parsedInput = CSON.parse(input);
        } catch (_) {
            parsedInput = input;
        }
    }
    try {
        const sublimeSyntaxConvertor = new SublimeSyntaxConvertor(parsedInput);
        return sublimeSyntaxConvertor.toYaml();
    } catch {
        return "Invalid input";
    }
}

document.getElementById("convert-input").addEventListener("input", function() {
    this.style.height = 0;
    this.style.height = (this.scrollHeight) + "px";

    const input = document.getElementById("convert-input").value;
    const output = convertInput(input);

    const outputElement = document.getElementById("convert-output");
    outputElement.value = output;
    outputElement.style.height = 0;
    outputElement.style.height = (outputElement.scrollHeight) + "px";
});

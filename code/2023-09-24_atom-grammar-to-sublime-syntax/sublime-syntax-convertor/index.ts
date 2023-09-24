// Copyright (c) 2015 Allen A. Bargi
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
// -----------------------------------------------------------------------------
//
// Original source retrieved from:
//   <https://github.com/aziz/SublimeSyntaxConvertor/tree/8af296b42c7497455bb495bcc43bcbe60b1c464f>
//
// Transliterated by Pit Kleyersburg <pitkley@googlemail.com> from Ruby to
// TypeScript, with one modification applied: the constructor of
// SublimeSyntaxConvertor can take a pre-parsed object, rather than just a plist
// string.

const plist = require('plist');


class Formatter {
    formatComment(str: string) {
        str = str.trim().replace(/\t/g, "    ");
        if (str.includes("\n")) {
            str = str.trimEnd() + "\n";
        }
        return str;
    }

    formatRegex(str: string) {
        if (str.includes("\n")) {
            let lines = str.split("\n");
            let common_indent = this.leadingWhitespace(lines[1]);

            if (lines.length > 1) {
                lines.slice(2).forEach(line => {
                    let cur_indent = this.leadingWhitespace(line);

                    if (cur_indent.startsWith(common_indent)) {
                        return;
                    } else if (common_indent.startsWith(cur_indent)) {
                        common_indent = cur_indent;
                    } else {
                        common_indent = '';
                    }
                });

                if (!lines[0].startsWith(common_indent)) {
                    lines[0] = common_indent + lines[0].trimStart();
                }
            } else {
                common_indent = this.leadingWhitespace(lines[0]);
            }

            str = lines.map(line => line.slice(common_indent.length)).join("\n").trimEnd();
        }
        return str;
    }

    formatCaptures(cap: any) {
        let captures: {[key: string]: any} = {};

        for (const key in cap) {
            if (cap.hasOwnProperty(key)) {
                const value = cap[key];
                if (!value.hasOwnProperty('name')) {
                    console.log(`patterns and includes are not supported within captures: ${cap}`);
                    continue;
                }

                try {
                    captures[parseInt(key)] = value['name'];
                } catch (error) {
                    console.log('named capture used, this is unsupported');
                    captures[key] = value['name'];
                }
            }
        }

        return captures;
    }

    formatExternalSyntax(key: string) {
        if (['#', '$'].includes(key[0])) {
            throw new Error('invalid external syntax name');
        }

        if (key.includes('#')) {
            let [syntax, rule] = key.split('#');
            return `scope:${syntax}#${rule}`;
        } else {
            return `scope:${key}`;
        }
    }

    needsQuoting(str: string) {
        return (
            str === "" ||
            str.startsWith('<<') ||
            "\"'%-:?@\`&*!,#|>0123456789=".includes(str[0]) ||
            ['true', 'false', 'null'].includes(str) ||
            str.includes("# ") ||
            str.includes(': ') ||
            str.includes('[') ||
            str.includes(']') ||
            str.includes('{') ||
            str.includes('}') ||
            str.includes("\n") ||
            ":#".includes(str.slice(-1)) ||
            str.trim() !== str
        );
    }

    quote(str: string) {
        if (str.includes("\\") || str.includes('"')) {
            return "'" + str.replace(/'/g, "''") + "'";
        } else {
            return '"' + str.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
        }
    }

    leadingWhitespace(str: string) {
        return str.slice(0, str.length - str.trimStart().length);
    }
}

class MatchPattern extends Formatter {
    match: string;
    scope: string;
    captures: {[key: string]: any} | null;
    comment: string | null;

    constructor(pat: any) {
        super();
        this.match = this.formatRegex(pat.match);
        this.scope = pat.name ? pat.name : null;
        this.captures = pat.captures ? this.formatCaptures(pat.captures) : null;
        this.comment = (pat.comment && this.formatComment(pat.comment).length > 0) ? this.formatComment(pat.comment) : null;
    }

    toObject() {
        const obj: {[key: string]: any} = {};
        if (this.match) obj.match = this.match;
        if (this.scope) obj.scope = this.scope;
        if (this.captures) obj.captures = this.captures;
        if (this.comment) obj.comment = this.comment;
        return obj;
    }
}

class BeginEndPattern extends Formatter {
    pattern: any;
    type: string;
    match: string;
    pop: boolean;
    captures: {[key: string]: any} | undefined = undefined;
    scope: string | undefined = undefined;

    constructor(type: string, pattern: any) {
        super();
        this.pattern = pattern;
        this.type = type;
        this.match = this.formatRegex(pattern[type]);
        this.pop = type === 'end';
        this.handleCaptures();
    }

    toObject() {
        const obj: {[key: string]: any} = {};
        if (this.match) obj.match = this.match;
        if (this.pop) obj.pop = this.pop;
        if (this.captures) obj.captures = this.captures;
        return obj;
    }

    handleCaptures() {
        const patternCaptures = this.pattern[`${this.type}Captures`] || this.pattern.captures;
        if (!patternCaptures) return;

        const captures = this.formatCaptures(patternCaptures);
        if (captures['0']) {
            this.scope = captures['0'];
            delete captures['0'];
        }

        if (Object.keys(captures).length > 0) {
            this.captures = captures;
        }
    }
}

class SyntaxYaml extends Formatter {
    static TAB_SIZE = 2;
    public yaml: string;

    constructor(val: any) {
        super();
        this.yaml = this.toYaml(val, false, 0);
    }

    toYaml(val: any, startBlockOnNewline: boolean, indent: number) {
        let out = '';

        if (indent === 0) {
            out += "%YAML 1.2\n---\n";
            out += "# http://www.sublimetext.com/docs/3/syntax.html\n";
        }

        if (Array.isArray(val)) {
            out += this.arrayToYaml(val, startBlockOnNewline, indent);
        } else if (val !== null && typeof val === 'object') {
            out += this.hashToYaml(val, startBlockOnNewline, indent);
        } else if (typeof val === 'string') {
            out += this.stringToYaml(val, startBlockOnNewline, indent);
        } else if (val === true || val === false) {
            out += this.booleanToYaml(val);
        } else {
            out += `${val}\n`;
        }

        out = out.split("\n").map(line => line.trimEnd()).join("\n");
        return out;
    }

    arrayToYaml(val: any[], startBlockOnNewline: boolean, indent: number) {
        let out = '';
        if (val.length === 0) {
            out += "[]\n";
        } else {
            if (startBlockOnNewline) out += "\n";
            val.forEach(item => {
                out += ' '.repeat(indent) + '- ' + this.toYaml(item, false, indent + SyntaxYaml.TAB_SIZE);
            });
        }
        return out;
    }

    hashToYaml(val: {[key: number|string]: any}, startBlockOnNewline: boolean, indent: number) {
        let out = '';
        if (startBlockOnNewline) out += "\n";
        let first = true;
        this.orderKeys(Object.keys(val)).forEach(key => {
            let value = val[key];

            if (!first || startBlockOnNewline) {
                out += ' '.repeat(indent);
            } else {
                first = false;
            }

            if (typeof key === 'number') {
                out += key.toString();
            } else if (this.needsQuoting(key)) {
                out += this.quote(key);
            } else {
                out += key;
            }

            out += ": ";
            out += this.toYaml(value, true, indent + SyntaxYaml.TAB_SIZE);
        });
        return out;
    }

    stringToYaml(val: string, startBlockOnNewline: boolean, indent: number) {
        let out = '';
        if (this.needsQuoting(val)) {
            if (val.includes("\n")) {
                if (!startBlockOnNewline) {
                    throw new Error("Invalid input");
                }
                out += (val[val.length - 1] === "\n") ? "|\n" : "|-\n";
                val.split("\n").forEach(line => {
                    out += ' '.repeat(indent) + line + "\n";
                });
            } else {
                out += `${this.quote(val)}\n`;
            }
            return out;
        } else {
            return `${val}\n`;
        }
    }

    booleanToYaml(val: boolean) {
        return val ? "true\n" : "false\n";
    }

    orderKeys(list: (number|string)[]) {
        const keyOrder = ['name', 'main', 'match', 'comment', 'file_extensions', 'first_line_match', 'hidden', 'match', 'scope', 'main'].reverse();
        list = list.sort();
        keyOrder.forEach(key => {
            if (list.includes(key)) {
                list.splice(list.indexOf(key), 1);
                list.unshift(key);
            }
        });
        return list;
    }
}

export class SublimeSyntaxConvertor extends Formatter {
    lang: {[key: string]: any};
    repository: {[key: string]: any};
    patterns: any;
    syntax: any;

    constructor(lang: {[key: string]: any} | string) {
        super();
        if (typeof lang === 'string') {
            this.lang = plist.parse(lang);
        } else {
            this.lang = lang;
        }
        this.repository = this.lang.repository || {};
        this.patterns = this.lang.patterns || [];
        this.syntax = {};
        this.normalizeRepository();
        this.convert();
    }

    toYaml() {
        return new SyntaxYaml(this.syntax).yaml;
    }

    normalizeRepository() {
        for (const [key, value] of Object.entries(this.repository)) {
            if (value.begin || value.match) {
                this.repository[key] = [value];
            } else {
                this.repository[key] = value.patterns;
            }
        }
    }

    createContexts() {
        const contexts: {[key: string]: any} = {
            main: this.makeContext(this.lang.patterns),
        };

        for (const [key, value] of Object.entries(this.repository)) {
            if (key === 'main') {
                throw new Error('Double definition of main context');
            }

            contexts[key] = this.makeContext(value);
        }

        return contexts;
    }

    convert() {
        const syntax: {[key: string]: any} = {};
        if (this.lang.comment) syntax.comment = this.formatComment(this.lang.comment);
        if (this.lang.firstLineMatch) syntax.first_line_match = this.formatRegex(this.lang.firstLineMatch);
        if (this.lang.name) syntax.name = this.lang.name;
        if (this.lang.scopeName) syntax.scope = this.lang.scopeName;
        if (this.lang.fileTypes) syntax.file_extensions = this.lang.fileTypes;
        if (this.lang.hideFromUser) syntax.hidden = this.lang.hideFromUser;
        if (this.lang.hidden) syntax.hidden = this.lang.hidden;
        syntax.contexts = this.createContexts();
        this.syntax = syntax;
    }

    handleBeginPattern(pattern: any) {
        const entry: any = new BeginEndPattern('begin', pattern).toObject();
        if (pattern.comment && this.formatComment(pattern.comment).length > 0) {
            entry.comment = this.formatComment(pattern.comment);
        }
        entry.push = this.handleChildPattern(pattern);
        return entry;
    }

    handleChildPattern(pattern: any) {
        const endEntry = new BeginEndPattern('end', pattern).toObject();
        const childPatterns = pattern.patterns || [];
        const child = this.makeContext(childPatterns);
        const applyLast = pattern.applyEndPatternLast === 1;
        if (applyLast) {
            child.push(endEntry);
        } else {
            child.unshift(endEntry);
        }
        if (pattern.contentName) {
            child.unshift({ meta_content_scope: pattern.contentName });
        }
        if (pattern.name) {
            child.unshift({ meta_scope: pattern.name });
        }
        if (endEntry.match.includes("\\G")) {
            console.warn(`WARNING:
          pop pattern contains \\G, this will not work as expected
          if it's intended to refer to the begin regex: ${endEntry.match}`);
        }
        return child;
    }

    handleIncludePattern(pattern: any) {
        let key = pattern.include;
        if (key[0] === '#') {
            key = key.slice(1);
            if (!this.repository[key]) {
                throw new Error(`no entry in repository for ${key}`);
            }
            return { include: key };
        } else if (key === '$self') {
            return { include: 'main' };
        } else if (key === '$base') {
            return { include: '$top_level_main' };
        } else if (key[0] === '$') {
            throw new Error(`unknown include: ${key}`);
        } else {
            return { include: this.formatExternalSyntax(key) };
        }
    }

    makeContext(patterns: any[]) {
        const ctx = [];
        for (const pattern of patterns) {
            let entry;
            if (pattern.begin) {
                entry = this.handleBeginPattern(pattern);
            } else if (pattern.match) {
                entry = new MatchPattern(pattern).toObject();
            } else if (pattern.include) {
                entry = this.handleIncludePattern(pattern);
            } else {
                throw new Error(`unknown pattern type: ${Object.keys(pattern)}`);
            }
            if (entry) {
                ctx.push(entry);
            }
        }
        return ctx;
    }
}

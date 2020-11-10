import { ExtensionContext, commands, workspace, window, Range, Position, InputBoxOptions, Selection, TextEditor } from 'vscode';

type Options = {
  start: number
  digit: number
  operator: string
  step: number
  radix: number
  input: string
}
// this method is called when your extension is activated
function activate(context: ExtensionContext) {
  var insertCmd = commands.registerCommand('insertSequentialNumbers', function () {
    var editor = window.activeTextEditor;
    var initialSelections = editor.selections.sort(sortSelection);
    var inputOptions:InputBoxOptions = {};
    var undoStopBefore = true;
    inputOptions.placeHolder = "<start> <operator> <step> : <digit> : <radix>";
    inputOptions.validateInput = function (param) {
      if (param === "") {
        perform(initialSelections, editor, null, { undoStopBefore: undoStopBefore, undoStopAfter: false });
        return ''
      }
      var test = parseInput(param);
      if (!test) {
        return 'Syntax error. The rule is "<start> <operator> <step> : <digit> : <radix>".';
      }
      // realtime simulate
      perform(initialSelections, editor, test, { undoStopBefore: undoStopBefore, undoStopAfter: false });
      undoStopBefore = undoStopBefore && false;
      return ''
    };
    window.showInputBox(inputOptions)
      .then(function (value) {
        if (!value) {
          // undo
          if (!undoStopBefore) {
            commands.executeCommand("undo");
          }
          return;
        }
        // confirm input.
        const options = parseInput(value);
        if (options) {
          console.error('Syntax error. The rule is "<start> <operator> <step> : <digit> : <radix>".')
          perform(initialSelections, editor, options, { undoStopBefore: false, undoStopAfter: true });
        }
      });
  });

  context.subscriptions.push(insertCmd);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;

function sortSelection(a: Selection, b: Selection) {
  return a.anchor.line - b.anchor.line || a.anchor.character - b.anchor.character;
}

function perform(initial: Selection[], editor: TextEditor, options: Options, undoStop: Parameters<TextEditor['edit']>[1]) {
  var currentSelection = editor.selections.sort(sortSelection);
  var replaceSelection = workspace.getConfiguration("sequence").replaceSelection;
  editor.edit(function (builder) {
    initial.forEach(function (selection, index) {
      var endOfInitialSelection = replaceSelection ? selection.start.character : selection.end.character + (currentSelection[index].start.character - selection.start.character);
      builder.replace(new Range(new Position(selection.end.line, endOfInitialSelection), currentSelection[index].end), calculate(index, options));
    });
  }, undoStop);
}

const syntaxRegex = /^([+-]?[\da-fA-F]+(?:\.\d+)?)\s*([+-]|(?:\+\+|--))?\s*(\d+)?\s*(?::\s*(\d+))?\s*(?::\s*(\d+))?$/;
function parseInput(input: string): Options | null {
  const matches: RegExpMatchArray | null = input.match(syntaxRegex);
  if (!matches) {
    return null;
  }

  const radix = matches[5] ? parseInt(matches[5], 10) : 10;
  const start = parseInt(matches[1], radix);
  const operator = matches[2] || "+";
  const step = isNaN(matches[3]) ? 1 : parseInt(matches[3], 10);

  let digit = parseInt(matches[4], 10);
  if (isNaN(digit)) {
    digit = (start.toString() === matches[1]) ? 0 : matches[1].length;
    if (/^[+-]/.test(matches[1])) {
      digit = Math.max(digit - 1, 0);
    }
  }

  return {
    start: start,
    digit: digit,
    operator: operator,
    step: step,
    radix: radix,
    input: input
  };
}

function calculate(index: number, options: Options): string {
  var value = NaN;
  switch (options.operator) {
    case "++":
      value = options.start + index;
      break;
    case "--":
      value = options.start - index;
      break;
    case "+":
      value = options.start + (index * options.step);
      break;
    case "-":
      value = options.start - (index * options.step);
      break;
    default:
      return "";
  }

  const valueString = paddingZero(value, options.digit, options.radix);
  var hasAlpha = options.input.match(/([a-fA-F])/);
  if (hasAlpha) {
    // for hex.
    return hasAlpha[1] == hasAlpha[1].toLowerCase() ? valueString.toLowerCase() : valueString.toUpperCase();
  }
  return valueString
}

function paddingZero(num: number, dig: number, radix: number): string {
  if (!dig) {
    dig = 0;
  }
  if (!radix) {
    radix = 10;
  }
  var number = num.toString(radix);
  var numAbs = number.replace("-", "");
  var digit = Math.max(numAbs.length, dig);
  var result = "";
  if (0 <= number.indexOf("-")) {
    result += "-";
  }
  result += (Array(digit).join("0") + numAbs).slice(digit * -1);
  return result;
}
// Toolbar.js
import React, { useState } from 'react';
import { Transforms, Range, Editor } from 'slate';
import TableModal from './TableModal'; // Import modal
import { FaBold, FaItalic, FaUnderline, FaListUl, FaListOl, FaStrikethrough, FaLink, FaHeading } from 'react-icons/fa';

const Toolbar = ({ editor }) => { 
    console.log("Toolbar is rendering...");
    const preserveSelection = (editor, callback) => {
        const { selection } = editor;

        // If there's no selection, execute the callback and return
        if (!selection || Range.isCollapsed(selection)) {
            callback(selection);
            return;
        }

        const originalRange = Editor.range(editor, selection.anchor, selection.focus);
        
        const [anchor, focus] = Range.isBackward(selection)
            ? [originalRange.focus, originalRange.anchor]
            : [originalRange.anchor, originalRange.focus];

        // Execute the transformation
        console.log('Before transformation:', selection);
        const offsetAdjustment = callback(selection) || 0;
        console.log('After transformation:', editor.selection);

        const newRange = {
            anchor: {
                path: anchor.path,
                offset: anchor.offset,
            },
            focus: {
                path: focus.path,
                offset: focus.offset + offsetAdjustment,
            },
        };

        // Reapply the updated selection
        Transforms.setSelection(editor, newRange);
        console.log("Original Range:", originalRange);
        console.log("Offset Adjustment:", offsetAdjustment);
        console.log("New Anchor:", newRange.anchor);
        console.log("New Focus:", newRange.focus);
        console.log("New Range:", newRange);

    };


    const symmetricalSyntaxWrapper = (editor,syntax) => {
        const {selection} = editor;
        const selectedText = Editor.string(editor, selection);
        const isWrapped = selectedText.startsWith(syntax) && selectedText.endsWith(syntax);
        const syntaxLength = 2 * syntax.length

        preserveSelection(editor, () => {


            //If nothing is selected add syntax
            if (!selection || Range.isCollapsed(selection)) {
                Transforms.insertText(editor, `${syntax}${syntax}`);
                Transforms.move(editor, { distance: syntax.length, unit: 'character', reverse: true});
                return;
            }

            //If selected is already wrapped, remove it, else add it
            if (isWrapped) {
                const unwrappedText = selectedText.slice(syntax.length, -syntax.length);
                Transforms.insertText(editor, unwrappedText, { at: selection});
                return -syntaxLength

            } else {
                const wrappedText = `${syntax}${selectedText}${syntax}`;
                Transforms.insertText(editor, wrappedText, { at: selection});
                return syntaxLength
            }
        },
        );
    };

    const asymmetricalSyntaxWrapper = (editor,syntax) => {
        const {selection} = editor;
        const selectedText = Editor.string(editor, selection);
        const reversedSyntax = syntax.split('').reverse().join('');
        const isWrapped = selectedText.startsWith(syntax) && selectedText.endsWith(reversedSyntax);
        const syntaxLength = 2 * syntax.length
        preserveSelection(editor, () => {

            //If nothing is selected add syntax
            if (!selection || Range.isCollapsed(selection)) {
                Transforms.insertText(editor, `${syntax}${reversedSyntax}`);
                Transforms.move(editor, { distance: syntax.length, unit: 'character', reverse: true});
                return;
            }

            //If selected is already wrapped, remove it, else add it
            if (isWrapped) {
                const unwrappedText = selectedText.slice(syntax.length, -reversedSyntax.length);
                Transforms.insertText(editor, unwrappedText, { at: selection});
                return -syntaxLength
            } else {
                const wrappedText = `${syntax}${selectedText}${reversedSyntax}`;
                Transforms.insertText(editor, wrappedText, { at: selection});
                return syntaxLength
            }
        });
    };

    const twoSyntaxWrapper = (editor, syntax_1, syntax_2) => {
        const {selection} = editor;
        const selectedText = Editor.string(editor, selection);
        const isWrapped = selectedText.startsWith(syntax_1 + syntax_2) && selectedText.endsWith(syntax_2);
        const syntaxLength = syntax_1.length + 2 * syntax_2.length

        preserveSelection(editor, () => {
            //If nothing is selected add syntax
            if (!selection || Range.isCollapsed(selection)) {
                Transforms.insertText(editor, `${syntax_1}${syntax_2}${syntax_2}`);
                Transforms.move(editor, { distance: syntax_2.length, unit: 'character', reverse: true });
                return;
            }
            
            //If selected is already wrapped, remove it, else add it
            if (isWrapped) {
                const unwrappedText = selectedText.slice(
                    syntax_1.length + syntax_2.length,
                    -syntax_2.length
                );
                Transforms.insertText(editor, unwrappedText, { at: selection });
                return -syntaxLength
            } else {
                const wrappedText = `${syntax_1}${syntax_2}${selectedText}${syntax_2}`;
                Transforms.insertText(editor, wrappedText, { at: selection });
                return syntaxLength
            }
        });
    };

    const prePostPend = (editor, syntax_1, syntax_2) => {
        const {selection} = editor;
        const selectedText = Editor.string(editor, selection);
        const isWrapped = selectedText.startsWith(syntax_1 ) && selectedText.endsWith(syntax_2);
        const syntaxLength = syntax_1.length + syntax_2.length

        preserveSelection(editor, () => {
            //If nothing is selected add syntax
            if (!selection || Range.isCollapsed(selection)) {
                Transforms.insertText(editor, `${syntax_1}${syntax_2}`);
                Transforms.move(editor, { distance: syntax_2.length, unit: 'character', reverse: true });
                return;
            }
            
            //If selected is already wrapped, remove it, else add it
            if (isWrapped) {
                const unwrappedText = selectedText.slice(
                    syntax_1.length, selectedText.length - syntax_2.length
                );
                Transforms.insertText(editor, unwrappedText, { at: selection });
                return -syntaxLength
            } else {
                const wrappedText = `${syntax_1}${selectedText}${syntax_2}`;
                Transforms.insertText(editor, wrappedText, { at: selection });
                return syntaxLength
            }
        });
    };

    const prependSyntax = (editor, syntax, cutoff) => {
        const {selection} = editor;
        const selectedText = Editor.string(editor, selection);
        const syntaxLength = selectedText.startsWith(syntax) ? syntax.length : syntax.length + 1;
        const escapedSyntax = syntax.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        preserveSelection(editor, () => {

            const isPrepended = new RegExp(`^(${escapedSyntax}){${cutoff}}`).test(selectedText);

            if (isPrepended) {
                // Dynamically calculate removal length
                const removeSyntaxLength = syntax.length * cutoff + 1; // Add 1 for space
                const unPrependText = selectedText.replace(new RegExp(`^(${escapedSyntax}){1,${cutoff}} ?`), '');
                Transforms.insertText(editor, unPrependText, { at: selection });
                return -removeSyntaxLength; // Return dynamically calculated removal length
            } else {
                const prependText = selectedText.startsWith(syntax)
                    ? `${syntax}${selectedText}` // Prepend only syntax
                    : `${syntax} ${selectedText.trim()}`; // Prepend syntax and a space
                Transforms.insertText(editor, prependText, { at: selection });
                return syntaxLength; // Return original syntax length for addition
            }
        });
    };


    const insertTable = (editor, rows, cols) => {
        let table = '\n\n|===\n';

        // Add table headers
        table += '| ' + Array(cols).fill('Header').join(' | ') + '\n';

        // Add rows
        for (let i = 0; i < rows; i++) {
            table += '| ' + Array(cols).fill(`Row ${i + 1}`).join(' | ') + '\n';
        }

        table += '|===\n\n';

        Transforms.insertText(editor, table);
    };


    const [showTableModal, setShowTableModal] = useState(false);
    const handleInsertTable = (rows, cols) => {
        insertTable(editor, rows, cols);
    };

    const toolbarStyle = {
        display: 'flex',
        flexWrap: 'wrap',  // ✅ Ensure buttons wrap neatly
        justifyContent: 'flex-start',
        gap: '5px',  // ✅ Reduce spacing between buttons
        padding: '5px 10px',  // ✅ Smaller padding
        background: '#2c3e50',
        borderBottom: '2px solid #1a252f',
        alignItems: 'center',
        minHeight: '40px'  // ✅ Reduce toolbar height
    };
    
    const buttonStyle = {
        background: '#3498db',
        color: 'white',
        border: 'none',
        padding: '6px 10px',  // ✅ Smaller padding
        borderRadius: '4px',  // ✅ Less rounded corners
        cursor: 'pointer',
        fontSize: '13px',  // ✅ Reduce font size slightly
        transition: '0.2s ease-in-out',
        minWidth: '70px',  // ✅ Smaller button width
        textAlign: 'center'
    };

    // Hover effect
    const hoverStyle = {
    background: '#2980b9' // Darker blue on hover
};


    function Button({ syntax, name, wrapperFunction }) {
        return (
            <button
                style={{
                    ...buttonStyle,
                    transition: '0.3s ease-in-out',
                }}
                onMouseEnter={(e) => e.target.style.background = hoverStyle.background}
                onMouseLeave={(e) => e.target.style.background = buttonStyle.background}
                onMouseDown={(event) => {
                    event.preventDefault();
                    wrapperFunction(syntax);
                }}
            >
                {name}
            </button>
        );
    }

        return (
            <div  style={{ ...toolbarStyle, marginBottom: '5px' }}>
                < Button syntax = '**' name = 'Bold' wrapperFunction={(syntax) => symmetricalSyntaxWrapper(editor, syntax)}/>
                < Button syntax = '_' name = 'Italic' wrapperFunction={(syntax) => symmetricalSyntaxWrapper(editor, syntax)}/>
                < Button syntax = '*_' name = 'Bold / Italic' wrapperFunction={(syntax) => asymmetricalSyntaxWrapper(editor, syntax)} />
                < Button syntax = '`' name = 'Monospace' wrapperFunction={(syntax) => symmetricalSyntaxWrapper(editor, syntax)} />
                < Button syntax = '~' name = 'SubScript' wrapperFunction={(syntax) => symmetricalSyntaxWrapper(editor, syntax)} />
                < Button syntax = '^' name = 'Superscript' wrapperFunction={(syntax) => symmetricalSyntaxWrapper(editor, syntax)} />
                < Button syntax = '#' name = 'Highlight' wrapperFunction={(syntax) => symmetricalSyntaxWrapper(editor, syntax)} />
                < Button syntax = '+' name = 'Line Brake' wrapperFunction={(syntax) => Transforms.insertText(editor, syntax)} />
                < Button syntax = "'''" name = 'H Line' wrapperFunction={(syntax) => Transforms.insertText(editor, syntax)} />
                < Button syntax = '[line-through]' name = 'Strike-through' wrapperFunction={(syntax) => twoSyntaxWrapper(editor, syntax, '#')}/>
                < Button syntax = '=' name = 'Header' wrapperFunction={(syntax) => prependSyntax(editor, syntax, '6')} />
                < Button syntax = 'NOTE:' name = 'Note' wrapperFunction={(syntax) => prependSyntax(editor, syntax, '1')} />
                < Button syntax = 'TIP:' name = 'Tip' wrapperFunction={(syntax) => prependSyntax(editor, syntax, '1')} />
                < Button syntax = 'WARNING:' name = 'Warning' wrapperFunction={(syntax) => prependSyntax(editor, syntax, '1')} />
                < Button syntax = '.' name = 'Ordered List' wrapperFunction={(syntax) => prependSyntax(editor, syntax, '1')} />
                < Button syntax = '*' name = 'Unordered List' wrapperFunction={(syntax) => prependSyntax(editor, syntax, '1')} />
                < Button syntax = 'link:' name = 'Link' wrapperFunction={(syntax) => prePostPend(editor, syntax, "[Description]")}/>
                < Button syntax = 'image::' name = 'Image' wrapperFunction={(syntax) => prePostPend(editor, syntax, "[Description]")}/>
                < Button syntax = "" name = "Table" wrapperFunction={() => setShowTableModal(true)} />
                {showTableModal && <TableModal onInsertTable={handleInsertTable} onClose={() => setShowTableModal(false)} />}
            </div>

        );
};

export default Toolbar;

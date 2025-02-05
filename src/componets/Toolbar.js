// Toolbar.js
import React, { useState } from 'react';
import { Transforms, Range, Editor } from 'slate';
import TableModal from './TableModal'; // Import modal
import { FaAlignLeft, FaAlignCenter, FaAlignRight, FaBold, FaItalic, FaUnderline, FaStickyNote, FaLightbulb, FaExclamationTriangle, FaLevelDownAlt, FaListUl, FaMinus, FaListOl, FaStrikethrough, FaLink, FaImage, FaHeading, FaTerminal, FaSubscript, FaSuperscript, FaHighlighter, FaTable } from 'react-icons/fa';
import LinkModal from './LinkModal';
import ImageUploadButton from './ImageModal';
import ImportAsciiDocButton from './ImportAdoc';
import ExportAsciiDocButton from './ExportAsciiDocButton';

const ToolbarButton = ({ icon, onClick }) => (
    <button
        onMouseDown={(event) => {
            event.preventDefault();
            onClick();
        }}
        className="toolbar-button"
    >
        {icon}
    </button>
);


const Toolbar = ({ editor, value }) => { 
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
        flexWrap: 'wrap',  
        justifyContent: 'flex-start',
        gap: '5px',  
        padding: '5px 10px',  
        background: '#2c3e50',
        borderBottom: '2px solid #1a252f',
        alignItems: 'center',
        minHeight: '40px'  
    };
    
    const buttonStyle = {
        background: '#3498db',
        color: 'white',
        border: 'none',
        padding: '6px 10px',  
        borderRadius: '4px',  
        cursor: 'pointer',
        fontSize: '13px',  
        transition: '0.2s ease-in-out',
        minWidth: '70px',  
        textAlign: 'center'
    };

    // Hover effect
    const hoverStyle = {
        background: '#2980b9' // Darker blue on hover
    };

    const LinkButton = ({ editor }) => {
        const [showLinkModal, setLinkShowModal] = useState(false);
    
        return (
            <div className="toolbar-item">  {/* Ensure consistency */}
                <button
                    onMouseDown={(e) => {
                        e.preventDefault();
                        setLinkShowModal(true);
                    }}
                    className="toolbar-button"
                >
                    <FaLink />
                </button>
    
                {showLinkModal && <LinkModal editor={editor} onClose={() => setLinkShowModal(false)} />}
            </div>
        );
    };

        return (
            <div className="toolbar">
                <div className="toolbar-group">
                    <ImportAsciiDocButton editor={editor} />
                    <ExportAsciiDocButton value={value} />
                </div>
                <div className="toolbar-group">
                    <ToolbarButton icon={<FaBold />} onClick={() => symmetricalSyntaxWrapper(editor, '**')} />
                    <ToolbarButton icon={<FaItalic />} onClick={() => symmetricalSyntaxWrapper(editor, '_')}/>
                    <ToolbarButton icon={<FaUnderline />} onClick={() => twoSyntaxWrapper(editor, '[underline]', '#')} />
                    <ToolbarButton icon={<FaStrikethrough />} onClick={() => twoSyntaxWrapper(editor, '[line-through]', '#')} />
                    <ToolbarButton icon={<FaTerminal />} onClick={() => symmetricalSyntaxWrapper(editor, '`')} />
                    <ToolbarButton icon={<FaSubscript />} onClick={() => symmetricalSyntaxWrapper(editor, '~')} />
                    <ToolbarButton icon={<FaSuperscript />} onClick={() => symmetricalSyntaxWrapper(editor, '^')} />
                    <ToolbarButton icon={<FaHighlighter />} onClick={() => symmetricalSyntaxWrapper(editor, '#')} />
                </div>

                <div className="toolbar-group">
                    <ToolbarButton icon={<FaListUl />} onClick={() => prependSyntax(editor, '*', '1')} />
                    <ToolbarButton icon={<FaListOl />} onClick={() => prependSyntax(editor, '.', '1')} />
                    <ToolbarButton icon={<FaTable />} onClick={() => setShowTableModal(true)} />
                </div>
                
                <div className="toolbar-group">
                    <LinkButton editor={editor} />
                    <ImageUploadButton editor={editor} />
                </div>

                <div className="toolbar-group">
                    <ToolbarButton icon={<FaHeading />} onClick={() => prependSyntax(editor, '=', '6')} />
                </div>

                <div className="toolbar-group">
                    <ToolbarButton icon={<FaStickyNote />} onClick={() => prependSyntax(editor, 'NOTE:', '1')} />
                    <ToolbarButton icon={<FaLightbulb />} onClick={() => prependSyntax(editor, 'TIP:', '1')} />
                    <ToolbarButton icon={<FaExclamationTriangle />} onClick={() => prependSyntax(editor, 'WARNING:', '1')} />
                </div>

                <div className="toolbar-group">
                    <ToolbarButton icon={<FaLevelDownAlt />} onClick={() => Transforms.insertText(editor, ' +\n')} />
                    <ToolbarButton icon={<FaMinus />} onClick={() => Transforms.insertText(editor, "\n\n'''\n")} />
                </div>
                <div className="toolbar-group">
                    <ToolbarButton icon={<FaAlignLeft />} onClick={() => prePostPend(editor, '[.text-left]\n', '')} />
                    <ToolbarButton icon={<FaAlignCenter />} onClick={() => prePostPend(editor, '[.text-center]\n', '')} />
                    <ToolbarButton icon={<FaAlignRight />} onClick={() => prePostPend(editor, '[.text-right]\n', '')} />
                </div> 
                {showTableModal && <TableModal onInsertTable={handleInsertTable} onClose={() => setShowTableModal(false)} />}
                
            </div>

        );
};

export default Toolbar;

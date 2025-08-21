import type { NodeKey, SerializedLexicalNode, Spread } from "lexical";
import {
  DecoratorNode,
  $getNodeByKey,
} from "lexical";
import { Plus, Trash2 } from "lucide-react";
import React, { useCallback, useState, useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { Button } from "@/components/ui/button";

export type SerializedTableNode = Spread<{
  rows: number;
  columns: number;
  cells: string[][];
}, SerializedLexicalNode>;

export class TableNode extends DecoratorNode<React.ReactElement> {
  __rows: number;
  __columns: number;
  __cells: string[][];

  static getType(): string {
    return "notion-table";
  }

  static clone(node: TableNode): TableNode {
    return new TableNode(node.__rows, node.__columns, node.__cells, node.__key);
  }

  constructor(rows: number = 4, columns: number = 3, cells?: string[][], key?: NodeKey) {
    super(key);
    this.__rows = rows;
    this.__columns = columns;
    
    // Initialize cells with empty strings if not provided
    if (cells) {
      this.__cells = cells;
    } else {
      this.__cells = Array.from({ length: rows }, () => 
        Array.from({ length: columns }, () => "")
      );
    }
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.className = "table-container";
    return div;
  }

  updateDOM(): boolean {
    return false;
  }

  static importJSON(serializedNode: SerializedTableNode): TableNode {
    return new TableNode(serializedNode.rows, serializedNode.columns, serializedNode.cells);
  }

  exportJSON(): SerializedTableNode {
    return {
      ...super.exportJSON(),
      type: "notion-table",
      version: 1,
      rows: this.__rows,
      columns: this.__columns,
      cells: this.__cells,
    };
  }

  getRows(): number {
    return this.__rows;
  }

  getColumns(): number {
    return this.__columns;
  }

  getCells(): string[][] {
    return this.__cells;
  }

  setCellValue(row: number, col: number, value: string): void {
    if (row >= 0 && row < this.__rows && col >= 0 && col < this.__columns) {
      this.__cells[row][col] = value;
      this.markDirty();
    }
  }

  // Instead of modifying properties directly, we'll create new nodes
  // These methods will be called from the component to create new table nodes
  static createWithRows(rows: number, columns: number, cells: string[][]): TableNode {
    return new TableNode(rows, columns, cells);
  }

  decorate(): React.ReactElement {
    return (
      <TableComponent
        nodeKey={this.getKey()}
        rows={this.__rows}
        columns={this.__columns}
        cells={this.__cells}
      />
    );
  }
}

function TableComponent({
  nodeKey,
  rows,
  columns,
  cells,
}: {
  nodeKey: NodeKey;
  rows: number;
  columns: number;
  cells: string[][];
}) {
  const [editor] = useLexicalComposerContext();
  const [localCells, setLocalCells] = useState(cells);
  const [localRows, setLocalRows] = useState(rows);
  const [localColumns, setLocalColumns] = useState(columns);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  // Update local state when props change
  useEffect(() => {
    setLocalCells(cells);
    setLocalRows(rows);
    setLocalColumns(columns);
  }, [cells, rows, columns]);

  const updateNode = useCallback((newCells: string[][], newRows?: number, newColumns?: number) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node && $isTableNode(node)) {
        // Update cells
        for (let i = 0; i < newCells.length; i++) {
          for (let j = 0; j < newCells[i].length; j++) {
            node.setCellValue(i, j, newCells[i][j]);
          }
        }
        
        // If we need to change rows/columns, create a new node
        if (newRows !== undefined || newColumns !== undefined) {
          const finalRows = newRows ?? localRows;
          const finalColumns = newColumns ?? localColumns;
          const newNode = TableNode.createWithRows(finalRows, finalColumns, newCells);
          node.replace(newNode);
        }
      }
    });
  }, [editor, nodeKey, localRows, localColumns]);

  const handleCellChange = useCallback((row: number, col: number, value: string) => {
    const newCells = [...localCells];
    newCells[row][col] = value;
    setLocalCells(newCells);
    updateNode(newCells);
  }, [localCells, updateNode]);

  const handleAddRow = useCallback(() => {
    const newRows = localRows + 1;
    const newCells = [...localCells];
    newCells.push(Array.from({ length: localColumns }, () => ""));
    
    setLocalRows(newRows);
    setLocalCells(newCells);
    updateNode(newCells, newRows);
  }, [localRows, localColumns, localCells, updateNode]);

  const handleAddColumn = useCallback(() => {
    const newColumns = localColumns + 1;
    const newCells = localCells.map(row => [...row, ""]);
    
    setLocalColumns(newColumns);
    setLocalCells(newCells);
    updateNode(newCells, undefined, newColumns);
  }, [localRows, localColumns, localCells, updateNode]);

  const handleRemoveRow = useCallback((rowIndex: number) => {
    if (localRows > 1 && rowIndex >= 0 && rowIndex < localRows) {
      const newRows = localRows - 1;
      const newCells = localCells.filter((_, index) => index !== rowIndex);
      
      setLocalRows(newRows);
      setLocalCells(newCells);
      updateNode(newCells, newRows);
    }
  }, [localRows, localCells, updateNode]);

  const handleRemoveColumn = useCallback((colIndex: number) => {
    if (localColumns > 1 && colIndex >= 0 && colIndex < localColumns) {
      const newColumns = localColumns - 1;
      const newCells = localCells.map(row => row.filter((_, index) => index !== colIndex));
      
      setLocalColumns(newColumns);
      setLocalCells(newCells);
      updateNode(newCells, undefined, newColumns);
    }
  }, [localColumns, localCells, updateNode]);

  // Auto-resize helper for textareas
  const autoResize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  };

  return (
    <div className="table-container my-6 relative group">
      <div className="overflow-x-auto">
        <table className="min-w-max border-collapse border border-border rounded-lg overflow-hidden bg-background shadow-sm">
          <thead className="bg-muted/50">
            <tr>
              {Array.from({ length: localColumns }, (_, colIndex) => (
                <th
                  key={colIndex}
                  className="border border-border p-2 md:p-3 text-left font-medium text-sm relative group/th align-top w-[240px] min-w-[240px] max-w-[240px]"
                  onMouseEnter={() => setHoveredCol(colIndex)}
                  onMouseLeave={() => setHoveredCol(null)}
                >
                  <span className="block truncate">Column {colIndex + 1}</span>
                  {hoveredCol === colIndex && localColumns > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/th:opacity-100 transition-opacity"
                      onClick={() => handleRemoveColumn(colIndex)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: localRows }, (_, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-muted/30 transition-colors group/tr align-top"
                onMouseEnter={() => setHoveredRow(rowIndex)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {Array.from({ length: localColumns }, (_, colIndex) => (
                  <td
                    key={colIndex}
                    className="border border-border p-2 md:p-3 text-sm relative align-top w-[240px] min-w-[240px] max-w-[240px]"
                  >
                    <textarea
                      value={localCells[rowIndex]?.[colIndex] || ""}
                      onChange={(e) => {
                        autoResize(e.currentTarget);
                        handleCellChange(rowIndex, colIndex, e.target.value);
                      }}
                      ref={(el) => autoResize(el)}
                      rows={1}
                      className="w-full bg-transparent outline-none text-sm resize-none overflow-hidden leading-relaxed whitespace-pre-wrap break-words"
                      placeholder={`Cell ${rowIndex + 1}-${colIndex + 1}`}
                    />
                    {hoveredRow === rowIndex && rowIndex > 0 && colIndex === 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/tr:opacity-100 transition-opacity"
                        onClick={() => handleRemoveRow(rowIndex)}
                        aria-label="Remove row"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Controls */}
      <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddRow}
          className="flex items-center gap-1 text-xs"
        >
          <Plus className="w-3 h-3" />
          Add Row
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddColumn}
          className="flex items-center gap-1 text-xs"
        >
          <Plus className="w-3 h-3" />
          Add Column
        </Button>
      </div>
    </div>
  );
}

export function $createTableNode(rows: number = 4, columns: number = 3): TableNode {
  return new TableNode(rows, columns);
}

export function $isTableNode(node: any): node is TableNode {
  return node instanceof TableNode;
}

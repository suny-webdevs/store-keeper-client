"use client";

import React, { useState } from "react";
import { Plus, Trash2, Sliders, CheckSquare, AlignLeft, Calendar, Hash, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CategoryAttributeField } from "@/types/api";

interface AttributeSchemaBuilderProps {
  fields: CategoryAttributeField[];
  onChange: (fields: CategoryAttributeField[]) => void;
}

export function AttributeSchemaBuilder({
  fields,
  onChange,
}: AttributeSchemaBuilderProps) {
  const [newKey, setNewKey] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState<CategoryAttributeField["type"]>("string");
  const [newRequired, setNewRequired] = useState(false);
  const [newOptionsText, setNewOptionsText] = useState("");

  const handleAddField = () => {
    if (!newKey.trim() || !newLabel.trim()) return;

    const formattedKey = newKey
      .trim()
      .replace(/\s+/g, "_")
      .toLowerCase();

    const options =
      newType === "enum"
        ? newOptionsText
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

    const newField: CategoryAttributeField = {
      key: formattedKey,
      label: newLabel.trim(),
      type: newType,
      required: newRequired,
      options,
    };

    onChange([...fields, newField]);
    setNewKey("");
    setNewLabel("");
    setNewType("string");
    setNewRequired(false);
    setNewOptionsText("");
  };

  const handleRemoveField = (index: number) => {
    const updated = [...fields];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold text-foreground">
          Dynamic Attributes Schema ({fields.length})
        </Label>
        <span className="text-[11px] text-muted-foreground">
          Custom fields for products in this category
        </span>
      </div>

      {/* Existing Attributes List */}
      <div className="space-y-2">
        {fields.length === 0 ? (
          <p className="text-xs text-muted-foreground/80 italic py-2">
            No custom schema defined. Products will only have standard fields (SKU, barcode, price).
          </p>
        ) : (
          fields.map((field, idx) => (
            <div
              key={field.key + idx}
              className="flex items-center justify-between rounded-md border border-border p-2.5 bg-muted/20 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{field.label}</span>
                <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded num">
                  {field.key}
                </span>
                <span className="rounded bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 font-medium">
                  {field.type}
                </span>
                {field.required && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                    *required
                  </span>
                )}
                {field.options && (
                  <span className="text-[10px] text-muted-foreground truncate max-w-[140px]">
                    [{field.options.join(", ")}]
                  </span>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveField(idx)}
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Add New Attribute Sub-form */}
      <div className="rounded-lg border border-dashed border-border p-3 space-y-3 bg-card/60">
        <span className="text-xs font-medium text-foreground block">
          Add Custom Attribute Field
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <Input
              placeholder="Field Label (e.g. Warranty Months)"
              value={newLabel}
              onChange={(e) => {
                setNewLabel(e.target.value);
                if (!newKey) {
                  setNewKey(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]/g, "_")
                  );
                }
              }}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Input
              placeholder="Field Key (e.g. warranty_months)"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="h-8 text-xs font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Select
            value={newType}
            onValueChange={(val) => setNewType(val as CategoryAttributeField["type"])}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Data Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="string">Text String</SelectItem>
              <SelectItem value="number">Numeric Number</SelectItem>
              <SelectItem value="boolean">Boolean Toggle (Yes/No)</SelectItem>
              <SelectItem value="date">Date Picker</SelectItem>
              <SelectItem value="enum">Dropdown Options List</SelectItem>
            </SelectContent>
          </Select>

          <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none px-2">
            <input
              type="checkbox"
              checked={newRequired}
              onChange={(e) => setNewRequired(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
            />
            <span>Mandatory / Required Field</span>
          </label>
        </div>

        {newType === "enum" && (
          <Input
            placeholder="Options comma-separated: Bluetooth, Wired, USB-C"
            value={newOptionsText}
            onChange={(e) => setNewOptionsText(e.target.value)}
            className="h-8 text-xs"
          />
        )}

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleAddField}
          disabled={!newKey || !newLabel}
          className="w-full gap-1 text-xs h-8 border-border"
        >
          <Plus className="h-3 w-3" />
          <span>Add Schema Field</span>
        </Button>
      </div>
    </div>
  );
}

"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface WaitingListCheckbox {
  id: string;
  label: string;
}

interface WaitingListFormProps {
  waitingList: {
    title: string;
    description: string;
    buttonText: string;
    checkboxes: WaitingListCheckbox[];
  };
  onFieldChange: (field: string, value: any) => void;
}

export function WaitingListForm({ waitingList, onFieldChange }: WaitingListFormProps) {
  const handleBasicFieldChange = (field: string, value: string) => {
    onFieldChange(`register.waitingList.${field}`, value);
  };

  const addCheckbox = () => {
    const newCheckboxes = [
      ...waitingList.checkboxes,
      { id: `checkbox-${Date.now()}`, label: "" }
    ];
    onFieldChange("register.waitingList.checkboxes", newCheckboxes);
  };

  const removeCheckbox = (index: number) => {
    const newCheckboxes = [...waitingList.checkboxes];
    newCheckboxes.splice(index, 1);
    onFieldChange("register.waitingList.checkboxes", newCheckboxes);
  };

  const handleCheckboxChange = (index: number, value: string) => {
    const newCheckboxes = [...waitingList.checkboxes];
    newCheckboxes[index] = {
      ...newCheckboxes[index],
      label: value
    };
    onFieldChange("register.waitingList.checkboxes", newCheckboxes);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Waiting List</h3>
        <Button
          type="button"
          variant="outline"
          onClick={addCheckbox}
        >
          Add Checkbox
        </Button>
      </div>

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="waitinglist-title">Title</Label>
          <Input
            id="waitinglist-title"
            value={waitingList.title}
            onChange={(e) => handleBasicFieldChange("title", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="waitinglist-description">Description</Label>
          <Input
            id="waitinglist-description"
            value={waitingList.description}
            onChange={(e) => handleBasicFieldChange("description", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="waitinglist-button">Button Text</Label>
          <Input
            id="waitinglist-button"
            value={waitingList.buttonText}
            onChange={(e) => handleBasicFieldChange("buttonText", e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Checkboxes</h4>
          {waitingList.checkboxes.map((checkbox, index) => (
            <div key={checkbox.id} className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor={`checkbox-${index}`}>Checkbox {index + 1}</Label>
                <Input
                  id={`checkbox-${index}`}
                  value={checkbox.label}
                  onChange={(e) => handleCheckboxChange(index, e.target.value)}
                  placeholder="Checkbox label"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="self-end text-red-600 hover:text-red-800"
                onClick={() => removeCheckbox(index)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

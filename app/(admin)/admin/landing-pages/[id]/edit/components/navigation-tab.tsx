"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { NavigationConfig, NavigationItem } from "@/types/landing-page";

interface NavigationTabProps {
  navigation: NavigationConfig;
  onNavigationItemChange: (index: number, field: keyof NavigationItem, value: any) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
}

export function NavigationTab({
  navigation,
  onNavigationItemChange,
  onAddItem,
  onRemoveItem
}: NavigationTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Navigation Items</h3>
        <Button
          type="button"
          variant="outline"
          onClick={onAddItem}
        >
          Add Item
        </Button>
      </div>

      <div className="space-y-4">
        {navigation.desktopItems.map((item, index) => (
          <div key={item.id} className="grid gap-4 p-4 border rounded">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Item {index + 1}</h4>
              <Button
                type="button"
                variant="outline"
                onClick={() => onRemoveItem(index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`nav-${index}-label`}>Label</Label>
                <Input
                  id={`nav-${index}-label`}
                  value={item.label}
                  onChange={(e) => onNavigationItemChange(index, "label", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`nav-${index}-href`}>Link</Label>
                <Input
                  id={`nav-${index}-href`}
                  value={item.href}
                  onChange={(e) => onNavigationItemChange(index, "href", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`nav-${index}-order`}>Order</Label>
                <Input
                  id={`nav-${index}-order`}
                  type="number"
                  value={item.order}
                  onChange={(e) => onNavigationItemChange(index, "order", parseInt(e.target.value, 10))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`nav-${index}-target`}>Target</Label>
                <select
                  id={`nav-${index}-target`}
                  value={item.target || '_self'}
                  onChange={(e) => onNavigationItemChange(index, "target", e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="_self">Same Window</option>
                  <option value="_blank">New Window</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`nav-${index}-external`}
                checked={item.isExternal}
                onChange={(e) => onNavigationItemChange(index, "isExternal", e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor={`nav-${index}-external`}>External Link</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`nav-${index}-icon`}>Icon (optional)</Label>
              <Input
                id={`nav-${index}-icon`}
                value={item.icon || ""}
                onChange={(e) => onNavigationItemChange(index, "icon", e.target.value)}
                placeholder="e.g., home, settings, user"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

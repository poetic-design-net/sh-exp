import { FC } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const NavigationAdmin: FC = () => {
  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Navigation Management</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Menu Item
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Desktop Navigation</CardTitle>
            <CardDescription>
              Manage the main navigation menu shown on desktop devices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* We'll implement the desktop menu items list with Firebase data */}
              <p className="text-sm text-muted-foreground">
                No menu items added yet. Click the button above to add your first item.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mobile Navigation</CardTitle>
            <CardDescription>
              Manage the mobile menu items and structure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* We'll implement the mobile menu items list with Firebase data */}
              <p className="text-sm text-muted-foreground">
                No menu items added yet. Click the button above to add your first item.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NavigationAdmin;

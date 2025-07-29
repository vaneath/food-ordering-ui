import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, List, PlusCircle } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { columns, MenuItem } from "./columns";

export default function MenuManagement() {
  // Mock data - in a real app, this would come from an API
  const menuItems: MenuItem[] = [
    {
      id: "1",
      name: "Margherita Pizza",
      category: "Pizza",
      price: 12.99,
      isAvailable: true,
      ingredients: ["Tomato sauce", "Mozzarella", "Basil"],
    },
    {
      id: "2",
      name: "Caesar Salad",
      category: "Salads",
      price: 9.99,
      isAvailable: true,
      ingredients: ["Romaine", "Croutons", "Parmesan", "Caesar Dressing"],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Menu Management</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Menu Item
        </Button>
      </div>

      <Tabs defaultValue="items" className="space-y-4">
        <TabsList>
          <TabsTrigger value="items">Menu Items</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Menu Items</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <List className="mr-2 h-4 w-4" />
                    Categories
                  </Button>
                  <Button size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={menuItems} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Manage your menu categories here.</p>
              {/* Category management UI will go here */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Manage your inventory levels here.</p>
              {/* Inventory management UI will go here */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

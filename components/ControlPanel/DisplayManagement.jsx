import React from "react";
import { Button } from "../ui/button";
import { Plus, Minus } from "lucide-react";

const DisplayManagement = ({ assignments, handleAddScreen, handleRemoveScreen }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-6 bg-slate-400 rounded-full"></div>
        <h3 className="text-lg font-semibold text-slate-200">Display Management</h3>
      </div>

      <div className="flex gap-3 justify-center p-4 bg-slate-700/50 rounded-lg border border-slate-600">
        <Button
          onClick={handleAddScreen}
          disabled={assignments.length >= 6}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-transparent border-slate-500 text-slate-200 hover:bg-green-900/30 hover:border-green-500 hover:text-green-400 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Display
        </Button>

        <Button
          onClick={handleRemoveScreen}
          disabled={assignments.length <= 1}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-transparent border-slate-500 text-slate-200 hover:bg-red-900/30 hover:border-red-500 hover:text-red-400 transition-all"
        >
          <Minus className="w-4 h-4" />
          Remove Display
        </Button>
      </div>
    </div>
  );
};

export default DisplayManagement;

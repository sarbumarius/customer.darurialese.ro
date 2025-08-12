// src/components/content/StatusBadgesRow.tsx
import React from "react";
import { Badge } from "@/components/ui/badge";

const StatusBadgesRow: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-2 mb-2">
      <Badge variant="outline" className="cursor-pointer hover:bg-secondary px-3 py-1">
        ✅ OK
      </Badge>
      <Badge variant="outline" className="cursor-pointer hover:bg-secondary px-3 py-1">
        📞 Follow-up
      </Badge>
      <Badge variant="outline" className="cursor-pointer hover:bg-secondary px-3 py-1">
        ❓ Nelămurit
      </Badge>
      <Badge variant="outline" className="cursor-pointer hover:bg-secondary px-3 py-1">
        ❌ Respins
      </Badge>
    </div>
  );
};

export default StatusBadgesRow;

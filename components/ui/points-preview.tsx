import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import { pointsBody } from "@/app/api/_helpers/types/types";
import { Separator } from "@/components/ui/separator";

type PointsPreviewProps = {
  point: pointsBody;
};

export default function PointsPreview({ point }: PointsPreviewProps) {
  return (
    <Card
      className={`w-full h-full flex flex-row justify-between drop-shadow-md`}
    >
      <CardHeader className="w-full gap-2 items-start justify-between flex">
        <div className="w-full flex gap-2 items-start flex-col">
          <div className="w-full flex gap-2 items-start flex-row justify-between">
            <CardTitle>{point.reason}</CardTitle>
            <CardTitle>{point.points}</CardTitle>
          </div>
          <Separator />
        </div>
        <span className="flex">Team : {point.team.name}</span>
        <span className="flex">Created by : {point.createdBy}</span>
      </CardHeader>
    </Card>
  );
}
import { AIWatchtowerHub, createFieldServiceWatchtowerProvider } from "../../../components/AIWatchtower";
import { dataProvider } from "../services/platformAdapter";
import { dispatchAPI } from "../services/api";
import WorkOrderContextBar from "./WorkOrderContextBar";

export default function AIHub({ workOrder, onBack }) {
  // Create AI Watchtower provider
  const watchtowerProvider = createFieldServiceWatchtowerProvider(
    dataProvider,
    dispatchAPI,
    {
      itemLabel: "work order",
      itemLabelPlural: "work orders",
      solutionName: "TP Dispatch",
    }
  );

  return (
    <AIWatchtowerHub
      provider={watchtowerProvider}
      itemId={workOrder?.id}
      item={workOrder}
      contextBar={(props) => <WorkOrderContextBar workOrder={workOrder} onBack={onBack} {...props} />}
      referencePanelType="asset"
    />
  );
}


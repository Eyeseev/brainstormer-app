export interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ActionSection {
  id: string;
  title: string;
  items: ActionItem[];
}

export interface DistilledPlan {
  sections: ActionSection[];
}

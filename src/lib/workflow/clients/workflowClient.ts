import { Workflow } from "../types";
import { type WorkflowFormData } from "../schema";

// Dummy data storage
let workflows: Workflow[] = [
  {
    id: "wf-1",
    name: "Auto Process Trip Sheets",
    description: "Automatically process trip sheet documents and submit orders",
    status: "active",
    customer: "crowley",
    trigger: {
      type: "document_upload",
      config: {
        documentType: "Trip Sheet",
        customer: "crowley",
      },
    },
    steps: [
      {
        id: "step-1",
        type: "extract_data",
        name: "Extract Trip Data",
        config: {
          agentId: "agent-1",
        },
        order: 1,
        enabled: true,
      },
      {
        id: "step-2",
        type: "validate",
        name: "Validate Data",
        config: {
          validationRules: {
            requiredFields: ["driver", "truck", "route"],
          },
        },
        order: 2,
        enabled: true,
      },
      {
        id: "step-3",
        type: "submit",
        name: "Submit Order",
        config: {
          endpoint: "https://api.example.com/orders",
        },
        order: 3,
        enabled: true,
      },
    ],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
    lastRun: "2024-01-25T09:15:00Z",
    runCount: 145,
    successCount: 142,
    failureCount: 3,
    createdBy: "admin@example.com",
  },
  {
    id: "wf-2",
    name: "Daily Order Sync",
    description: "Sync orders every morning at 8 AM",
    status: "active",
    trigger: {
      type: "schedule",
      config: {
        schedule: "0 8 * * *",
      },
    },
    steps: [
      {
        id: "step-1",
        type: "extract_data",
        name: "Fetch Orders",
        config: {
          endpoint: "https://api.example.com/orders",
        },
        order: 1,
        enabled: true,
      },
      {
        id: "step-2",
        type: "notify",
        name: "Notify Team",
        config: {
          recipients: ["team@example.com"],
          message: "Daily order sync completed",
        },
        order: 2,
        enabled: true,
      },
    ],
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-01-10T08:00:00Z",
    lastRun: "2024-01-25T08:00:00Z",
    runCount: 15,
    successCount: 15,
    failureCount: 0,
    createdBy: "admin@example.com",
  },
  {
    id: "wf-3",
    name: "Booking Confirmation Processor",
    description: "Process booking confirmations with AI validation",
    status: "draft",
    customer: "maersk",
    trigger: {
      type: "document_upload",
      config: {
        documentType: "Booking Confirmation",
        customer: "maersk",
      },
    },
    steps: [
      {
        id: "step-1",
        type: "ai_process",
        name: "AI Data Extraction",
        config: {
          agentId: "agent-2",
          promptId: "prompt-1",
        },
        order: 1,
        enabled: true,
      },
      {
        id: "step-2",
        type: "validate",
        name: "Validate Booking",
        config: {
          validationRules: {
            requiredFields: ["booking_number", "vessel", "departure_date"],
          },
        },
        order: 2,
        enabled: true,
      },
      {
        id: "step-3",
        type: "notify",
        name: "Notify Operations",
        config: {
          recipients: ["ops@maersk.com"],
          message: "New booking confirmation processed",
        },
        order: 3,
        enabled: false,
      },
    ],
    createdAt: "2024-01-20T12:00:00Z",
    updatedAt: "2024-01-22T16:00:00Z",
    runCount: 0,
    successCount: 0,
    failureCount: 0,
    createdBy: "user@example.com",
  },
  {
    id: "wf-4",
    name: "Webhook Order Handler",
    description: "Handle incoming orders via webhook",
    status: "active",
    trigger: {
      type: "webhook",
      config: {
        webhookUrl: "https://api.example.com/webhooks/orders",
      },
    },
    steps: [
      {
        id: "step-1",
        type: "transform",
        name: "Transform Payload",
        config: {
          transformRules: {
            mapping: {
              orderId: "id",
              customerName: "customer.name",
            },
          },
        },
        order: 1,
        enabled: true,
      },
      {
        id: "step-2",
        type: "submit",
        name: "Create Order",
        config: {
          endpoint: "https://api.example.com/orders/create",
        },
        order: 2,
        enabled: true,
      },
    ],
    createdAt: "2024-01-05T10:00:00Z",
    updatedAt: "2024-01-18T11:00:00Z",
    lastRun: "2024-01-25T10:30:00Z",
    runCount: 89,
    successCount: 87,
    failureCount: 2,
    createdBy: "admin@example.com",
  },
];

export const workflowClient = {
  async list(params?: { search?: string; status?: string; customer?: string }): Promise<Workflow[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    let filtered = [...workflows];
    
    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(
        (w) =>
          w.name.toLowerCase().includes(search) ||
          w.description?.toLowerCase().includes(search)
      );
    }
    
    if (params?.status) {
      filtered = filtered.filter((w) => w.status === params.status);
    }
    
    if (params?.customer) {
      filtered = filtered.filter((w) => w.customer === params.customer);
    }
    
    return filtered;
  },

  async get(id: string): Promise<Workflow> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const workflow = workflows.find((w) => w.id === id);
    if (!workflow) {
      throw new Error(`Workflow with id ${id} not found`);
    }
    return workflow;
  },

  async create(data: WorkflowFormData): Promise<Workflow> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const newWorkflow: Workflow = {
      id: `wf-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      runCount: 0,
      successCount: 0,
      failureCount: 0,
      createdBy: "current-user@example.com",
    };
    
    workflows.push(newWorkflow);
    return newWorkflow;
  },

  async update(id: string, data: Partial<WorkflowFormData>): Promise<Workflow> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const index = workflows.findIndex((w) => w.id === id);
    if (index === -1) {
      throw new Error(`Workflow with id ${id} not found`);
    }
    
    workflows[index] = {
      ...workflows[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    return workflows[index];
  },

  async delete(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const index = workflows.findIndex((w) => w.id === id);
    if (index === -1) {
      throw new Error(`Workflow with id ${id} not found`);
    }
    
    workflows.splice(index, 1);
  },

  async run(id: string): Promise<{ success: boolean; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const workflow = workflows.find((w) => w.id === id);
    if (!workflow) {
      throw new Error(`Workflow with id ${id} not found`);
    }
    
    const success = Math.random() > 0.1; // 90% success rate
    
    workflow.runCount++;
    workflow.lastRun = new Date().toISOString();
    if (success) {
      workflow.successCount++;
    } else {
      workflow.failureCount++;
    }
    
    return {
      success,
      message: success ? "Workflow executed successfully" : "Workflow execution failed",
    };
  },
};


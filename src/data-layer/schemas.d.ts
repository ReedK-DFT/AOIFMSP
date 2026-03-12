import { z } from 'zod';
export declare const jsonObjectSchema: z.ZodRecord<z.ZodString, z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>;
export declare const workflowApprovalPolicySchema: z.ZodObject<{
    required: z.ZodBoolean;
    approverRoles: z.ZodOptional<z.ZodArray<z.ZodString>>;
    timeoutSeconds: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export declare const userBindingMapSchema: z.ZodObject<{
    actions: z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString>>;
    modifiers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString>>>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>>;
}, z.core.$strict>;
export declare const aiAgentWorkflowNodeSchema: z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    position: z.ZodOptional<z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, z.core.$strict>>;
    disabled: z.ZodOptional<z.ZodBoolean>;
    type: z.ZodLiteral<"ai-agent">;
    agentId: z.ZodString;
    agentVersionId: z.ZodString;
    foundryProjectRef: z.ZodString;
    operatingMode: z.ZodEnum<{
        "suggest-only": "suggest-only";
        "act-with-tools": "act-with-tools";
        "approval-required": "approval-required";
    }>;
    inputTemplate: z.ZodRecord<z.ZodString, z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>;
    outputSchema: z.ZodRecord<z.ZodString, z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>;
    toolPolicyRef: z.ZodOptional<z.ZodString>;
    approvalPolicy: z.ZodObject<{
        required: z.ZodBoolean;
        approverRoles: z.ZodOptional<z.ZodArray<z.ZodString>>;
        timeoutSeconds: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>;
    timeoutSeconds: z.ZodNumber;
    maxRetries: z.ZodNumber;
}, z.core.$strip>;
export declare const workflowNodeSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    position: z.ZodOptional<z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, z.core.$strict>>;
    disabled: z.ZodOptional<z.ZodBoolean>;
    type: z.ZodLiteral<"trigger">;
    triggerType: z.ZodEnum<{
        manual: "manual";
        schedule: "schedule";
        webhook: "webhook";
        polling: "polling";
        queue: "queue";
    }>;
    config: z.ZodRecord<z.ZodString, z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    position: z.ZodOptional<z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, z.core.$strict>>;
    disabled: z.ZodOptional<z.ZodBoolean>;
    type: z.ZodLiteral<"connector-action">;
    connectorId: z.ZodString;
    connectorVersionId: z.ZodString;
    actionId: z.ZodString;
    connectionId: z.ZodString;
    inputs: z.ZodRecord<z.ZodString, z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>;
    outputs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    position: z.ZodOptional<z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, z.core.$strict>>;
    disabled: z.ZodOptional<z.ZodBoolean>;
    type: z.ZodLiteral<"condition">;
    expression: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    position: z.ZodOptional<z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, z.core.$strict>>;
    disabled: z.ZodOptional<z.ZodBoolean>;
    type: z.ZodLiteral<"loop">;
    collectionExpression: z.ZodString;
    itemVariable: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    position: z.ZodOptional<z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, z.core.$strict>>;
    disabled: z.ZodOptional<z.ZodBoolean>;
    type: z.ZodLiteral<"data-transform">;
    transform: z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>, z.ZodString]>;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    position: z.ZodOptional<z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, z.core.$strict>>;
    disabled: z.ZodOptional<z.ZodBoolean>;
    type: z.ZodLiteral<"variable">;
    variableName: z.ZodString;
    valueExpression: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    position: z.ZodOptional<z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, z.core.$strict>>;
    disabled: z.ZodOptional<z.ZodBoolean>;
    type: z.ZodLiteral<"javascript">;
    inlineScript: z.ZodOptional<z.ZodString>;
    scriptBlobPath: z.ZodOptional<z.ZodString>;
    inputBindings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>>;
    outputBindings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    timeoutSeconds: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    position: z.ZodOptional<z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, z.core.$strict>>;
    disabled: z.ZodOptional<z.ZodBoolean>;
    type: z.ZodLiteral<"ai-agent">;
    agentId: z.ZodString;
    agentVersionId: z.ZodString;
    foundryProjectRef: z.ZodString;
    operatingMode: z.ZodEnum<{
        "suggest-only": "suggest-only";
        "act-with-tools": "act-with-tools";
        "approval-required": "approval-required";
    }>;
    inputTemplate: z.ZodRecord<z.ZodString, z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>;
    outputSchema: z.ZodRecord<z.ZodString, z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>;
    toolPolicyRef: z.ZodOptional<z.ZodString>;
    approvalPolicy: z.ZodObject<{
        required: z.ZodBoolean;
        approverRoles: z.ZodOptional<z.ZodArray<z.ZodString>>;
        timeoutSeconds: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>;
    timeoutSeconds: z.ZodNumber;
    maxRetries: z.ZodNumber;
}, z.core.$strip>], "type">;
export declare const workflowEdgeSchema: z.ZodObject<{
    id: z.ZodString;
    sourceNodeId: z.ZodString;
    sourcePort: z.ZodOptional<z.ZodString>;
    targetNodeId: z.ZodString;
    targetPort: z.ZodOptional<z.ZodString>;
    label: z.ZodOptional<z.ZodString>;
    conditionExpression: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const workflowVariableDefinitionSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<{
        string: "string";
        number: "number";
        boolean: "boolean";
        object: "object";
        unknown: "unknown";
        array: "array";
    }>;
    initialValue: z.ZodOptional<z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>;
}, z.core.$strict>;
export declare const workflowConnectionBindingSchema: z.ZodObject<{
    connectionId: z.ZodString;
    connectorId: z.ZodOptional<z.ZodString>;
    alias: z.ZodOptional<z.ZodString>;
    scopeType: z.ZodOptional<z.ZodEnum<{
        msp: "msp";
        client: "client";
    }>>;
    requiredActions: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strict>;
export declare const workflowBindingsSchema: z.ZodObject<{
    connections: z.ZodArray<z.ZodObject<{
        connectionId: z.ZodString;
        connectorId: z.ZodOptional<z.ZodString>;
        alias: z.ZodOptional<z.ZodString>;
        scopeType: z.ZodOptional<z.ZodEnum<{
            msp: "msp";
            client: "client";
        }>>;
        requiredActions: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const workflowTriggerDefinitionSchema: z.ZodObject<{
    type: z.ZodEnum<{
        manual: "manual";
        schedule: "schedule";
        webhook: "webhook";
        polling: "polling";
        queue: "queue";
    }>;
    config: z.ZodRecord<z.ZodString, z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>;
}, z.core.$strict>;
export declare const workflowAiMetadataSchema: z.ZodObject<{
    designSessionId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    draftSource: z.ZodEnum<{
        manual: "manual";
        ai: "ai";
        "manual-or-ai": "manual-or-ai";
    }>;
    assumptions: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strict>;
export declare const workflowEditorStateSchema: z.ZodObject<{
    viewport: z.ZodRecord<z.ZodString, z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>;
    selectedNodeIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    sidebarState: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>>;
}, z.core.$strict>;
export declare const workflowDocumentSchema: z.ZodObject<{
    schemaVersion: z.ZodNumber;
    workflowId: z.ZodString;
    workflowVersionId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    displayName: z.ZodString;
    trigger: z.ZodObject<{
        type: z.ZodEnum<{
            manual: "manual";
            schedule: "schedule";
            webhook: "webhook";
            polling: "polling";
            queue: "queue";
        }>;
        config: z.ZodRecord<z.ZodString, z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>;
    }, z.core.$strict>;
    nodes: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        position: z.ZodOptional<z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, z.core.$strict>>;
        disabled: z.ZodOptional<z.ZodBoolean>;
        type: z.ZodLiteral<"trigger">;
        triggerType: z.ZodEnum<{
            manual: "manual";
            schedule: "schedule";
            webhook: "webhook";
            polling: "polling";
            queue: "queue";
        }>;
        config: z.ZodRecord<z.ZodString, z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        position: z.ZodOptional<z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, z.core.$strict>>;
        disabled: z.ZodOptional<z.ZodBoolean>;
        type: z.ZodLiteral<"connector-action">;
        connectorId: z.ZodString;
        connectorVersionId: z.ZodString;
        actionId: z.ZodString;
        connectionId: z.ZodString;
        inputs: z.ZodRecord<z.ZodString, z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>;
        outputs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        position: z.ZodOptional<z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, z.core.$strict>>;
        disabled: z.ZodOptional<z.ZodBoolean>;
        type: z.ZodLiteral<"condition">;
        expression: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        position: z.ZodOptional<z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, z.core.$strict>>;
        disabled: z.ZodOptional<z.ZodBoolean>;
        type: z.ZodLiteral<"loop">;
        collectionExpression: z.ZodString;
        itemVariable: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        position: z.ZodOptional<z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, z.core.$strict>>;
        disabled: z.ZodOptional<z.ZodBoolean>;
        type: z.ZodLiteral<"data-transform">;
        transform: z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>, z.ZodString]>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        position: z.ZodOptional<z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, z.core.$strict>>;
        disabled: z.ZodOptional<z.ZodBoolean>;
        type: z.ZodLiteral<"variable">;
        variableName: z.ZodString;
        valueExpression: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        position: z.ZodOptional<z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, z.core.$strict>>;
        disabled: z.ZodOptional<z.ZodBoolean>;
        type: z.ZodLiteral<"javascript">;
        inlineScript: z.ZodOptional<z.ZodString>;
        scriptBlobPath: z.ZodOptional<z.ZodString>;
        inputBindings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>>;
        outputBindings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        timeoutSeconds: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        position: z.ZodOptional<z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, z.core.$strict>>;
        disabled: z.ZodOptional<z.ZodBoolean>;
        type: z.ZodLiteral<"ai-agent">;
        agentId: z.ZodString;
        agentVersionId: z.ZodString;
        foundryProjectRef: z.ZodString;
        operatingMode: z.ZodEnum<{
            "suggest-only": "suggest-only";
            "act-with-tools": "act-with-tools";
            "approval-required": "approval-required";
        }>;
        inputTemplate: z.ZodRecord<z.ZodString, z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>;
        outputSchema: z.ZodRecord<z.ZodString, z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>;
        toolPolicyRef: z.ZodOptional<z.ZodString>;
        approvalPolicy: z.ZodObject<{
            required: z.ZodBoolean;
            approverRoles: z.ZodOptional<z.ZodArray<z.ZodString>>;
            timeoutSeconds: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strict>;
        timeoutSeconds: z.ZodNumber;
        maxRetries: z.ZodNumber;
    }, z.core.$strip>], "type">>;
    edges: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        sourceNodeId: z.ZodString;
        sourcePort: z.ZodOptional<z.ZodString>;
        targetNodeId: z.ZodString;
        targetPort: z.ZodOptional<z.ZodString>;
        label: z.ZodOptional<z.ZodString>;
        conditionExpression: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
    variables: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        type: z.ZodEnum<{
            string: "string";
            number: "number";
            boolean: "boolean";
            object: "object";
            unknown: "unknown";
            array: "array";
        }>;
        initialValue: z.ZodOptional<z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>;
    }, z.core.$strict>>;
    bindings: z.ZodObject<{
        connections: z.ZodArray<z.ZodObject<{
            connectionId: z.ZodString;
            connectorId: z.ZodOptional<z.ZodString>;
            alias: z.ZodOptional<z.ZodString>;
            scopeType: z.ZodOptional<z.ZodEnum<{
                msp: "msp";
                client: "client";
            }>>;
            requiredActions: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    ai: z.ZodObject<{
        designSessionId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        draftSource: z.ZodEnum<{
            manual: "manual";
            ai: "ai";
            "manual-or-ai": "manual-or-ai";
        }>;
        assumptions: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>;
    editor: z.ZodObject<{
        viewport: z.ZodRecord<z.ZodString, z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>;
        selectedNodeIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
        sidebarState: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>>;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const managementOperationTargetSchema: z.ZodObject<{
    userId: z.ZodOptional<z.ZodString>;
    groupId: z.ZodOptional<z.ZodString>;
    roleId: z.ZodOptional<z.ZodString>;
    deviceId: z.ZodOptional<z.ZodString>;
    tenantId: z.ZodOptional<z.ZodString>;
}, z.core.$catchall<z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>>;
export declare const managementOperationDocumentSchema: z.ZodObject<{
    operationId: z.ZodString;
    operationType: z.ZodString;
    mspTenantId: z.ZodString;
    clientTenantId: z.ZodString;
    authMode: z.ZodEnum<{
        "gdap-obo": "gdap-obo";
        "platform-app": "platform-app";
        delegated: "delegated";
        custom: "custom";
    }>;
    target: z.ZodObject<{
        userId: z.ZodOptional<z.ZodString>;
        groupId: z.ZodOptional<z.ZodString>;
        roleId: z.ZodOptional<z.ZodString>;
        deviceId: z.ZodOptional<z.ZodString>;
        tenantId: z.ZodOptional<z.ZodString>;
    }, z.core.$catchall<z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>>;
    parameters: z.ZodRecord<z.ZodString, z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>;
    approval: z.ZodObject<{
        required: z.ZodBoolean;
        approverRoles: z.ZodOptional<z.ZodArray<z.ZodString>>;
        timeoutSeconds: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const designTimeAssistantOutputSchema: z.ZodObject<{
    goal: z.ZodString;
    proposedWorkflowPatch: z.ZodRecord<z.ZodString, z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>;
    assumptions: z.ZodArray<z.ZodString>;
    warnings: z.ZodArray<z.ZodString>;
    recommendedConnections: z.ZodArray<z.ZodString>;
    recommendedTriggers: z.ZodArray<z.ZodString>;
}, z.core.$strict>;
export declare const executionStateDocumentSchema: z.ZodObject<{
    executionId: z.ZodString;
    workflowId: z.ZodString;
    workflowVersionId: z.ZodString;
    mspTenantId: z.ZodString;
    clientTenantId: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<{
        queued: "queued";
        running: "running";
        succeeded: "succeeded";
        failed: "failed";
        cancelled: "cancelled";
        partial: "partial";
    }>;
    variables: z.ZodRecord<z.ZodString, z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>;
    completedNodeIds: z.ZodArray<z.ZodString>;
    pendingNodeIds: z.ZodArray<z.ZodString>;
    failedNodeIds: z.ZodArray<z.ZodString>;
    correlationId: z.ZodString;
}, z.core.$strict>;
export declare const keyVaultSecretPayloadSchema: z.ZodObject<{
    authType: z.ZodEnum<{
        custom: "custom";
        "oauth2-client-credentials": "oauth2-client-credentials";
        "oauth2-authorization-code": "oauth2-authorization-code";
        "oauth2-on-behalf-of": "oauth2-on-behalf-of";
        "api-key": "api-key";
        "basic-auth": "basic-auth";
        certificate: "certificate";
    }>;
    clientId: z.ZodOptional<z.ZodString>;
    clientSecret: z.ZodOptional<z.ZodString>;
    tokenUrl: z.ZodOptional<z.ZodString>;
    scopes: z.ZodOptional<z.ZodArray<z.ZodString>>;
    username: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
    apiKey: z.ZodOptional<z.ZodString>;
    headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, z.core.$strict>;
export declare const workflowStartQueueMessageSchema: z.ZodObject<{
    correlationId: z.ZodString;
    enqueuedAt: z.ZodString;
    messageType: z.ZodLiteral<"workflow-start">;
    executionId: z.ZodString;
    mspTenantId: z.ZodString;
    workflowId: z.ZodString;
    workflowVersionId: z.ZodString;
    clientTenantId: z.ZodOptional<z.ZodString>;
    triggerId: z.ZodOptional<z.ZodString>;
    triggerType: z.ZodEnum<{
        manual: "manual";
        schedule: "schedule";
        webhook: "webhook";
        polling: "polling";
        queue: "queue";
    }>;
    inputBlobPath: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const workflowStepQueueMessageSchema: z.ZodObject<{
    correlationId: z.ZodString;
    enqueuedAt: z.ZodString;
    messageType: z.ZodLiteral<"workflow-step">;
    executionId: z.ZodString;
    stepId: z.ZodString;
    stepIndex: z.ZodNumber;
    attempt: z.ZodNumber;
    mspTenantId: z.ZodString;
    workflowId: z.ZodString;
    workflowVersionId: z.ZodString;
    clientTenantId: z.ZodOptional<z.ZodString>;
    resumeFromNodeId: z.ZodString;
    contextBlobPath: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const aiAgentStepQueueMessageSchema: z.ZodObject<{
    correlationId: z.ZodString;
    enqueuedAt: z.ZodString;
    messageType: z.ZodLiteral<"ai-agent-step">;
    aiAgentRunId: z.ZodString;
    executionId: z.ZodString;
    executionStepId: z.ZodString;
    mspTenantId: z.ZodString;
    workflowId: z.ZodString;
    workflowVersionId: z.ZodString;
    clientTenantId: z.ZodOptional<z.ZodString>;
    agentId: z.ZodString;
    agentVersionId: z.ZodString;
    foundryProjectRef: z.ZodString;
    inputBlobPath: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const managementOperationQueueMessageSchema: z.ZodObject<{
    correlationId: z.ZodString;
    enqueuedAt: z.ZodString;
    messageType: z.ZodLiteral<"management-operation">;
    operationId: z.ZodString;
    mspTenantId: z.ZodString;
    clientTenantId: z.ZodString;
    operationType: z.ZodString;
    authMode: z.ZodEnum<{
        "gdap-obo": "gdap-obo";
        "platform-app": "platform-app";
        delegated: "delegated";
        custom: "custom";
    }>;
    connectionId: z.ZodOptional<z.ZodString>;
    requestedByType: z.ZodEnum<{
        user: "user";
        workflow: "workflow";
        system: "system";
        "user-or-workflow": "user-or-workflow";
        "user-or-system": "user-or-system";
    }>;
    requestedById: z.ZodString;
    requestBlobPath: z.ZodString;
}, z.core.$strip>;
export declare const technicianContextRefreshQueueMessageSchema: z.ZodObject<{
    correlationId: z.ZodString;
    enqueuedAt: z.ZodString;
    messageType: z.ZodLiteral<"technician-context-refresh">;
    mspTenantId: z.ZodString;
    contextType: z.ZodEnum<{
        user: "user";
        workflow: "workflow";
        tenant: "tenant";
        ticket: "ticket";
        device: "device";
        documentation: "documentation";
        alert: "alert";
    }>;
    contextId: z.ZodString;
    sourceSystem: z.ZodString;
    requestedByType: z.ZodEnum<{
        user: "user";
        workflow: "workflow";
        system: "system";
        "user-or-workflow": "user-or-workflow";
        "user-or-system": "user-or-system";
    }>;
    requestedById: z.ZodString;
}, z.core.$strip>;
export declare const directorySyncRefreshQueueMessageSchema: z.ZodObject<{
    correlationId: z.ZodString;
    enqueuedAt: z.ZodString;
    messageType: z.ZodLiteral<"directory-sync-refresh">;
    mspTenantId: z.ZodString;
    clientTenantId: z.ZodString;
    datasetName: z.ZodString;
    authMode: z.ZodEnum<{
        "gdap-obo": "gdap-obo";
        "platform-app": "platform-app";
        delegated: "delegated";
        custom: "custom";
    }>;
    requestedByType: z.ZodEnum<{
        user: "user";
        workflow: "workflow";
        system: "system";
        "user-or-workflow": "user-or-workflow";
        "user-or-system": "user-or-system";
    }>;
    requestedById: z.ZodString;
}, z.core.$strip>;
export declare const standardsEvaluationQueueMessageSchema: z.ZodObject<{
    correlationId: z.ZodString;
    enqueuedAt: z.ZodString;
    messageType: z.ZodLiteral<"standards-evaluation">;
    mspTenantId: z.ZodString;
    targetType: z.ZodEnum<{
        tenant: "tenant";
        "tenant-group": "tenant-group";
    }>;
    targetId: z.ZodString;
    standardId: z.ZodString;
    requestedByType: z.ZodEnum<{
        user: "user";
        workflow: "workflow";
        system: "system";
        "user-or-workflow": "user-or-workflow";
        "user-or-system": "user-or-system";
    }>;
    requestedById: z.ZodString;
}, z.core.$strip>;
export declare const pollingTriggerQueueMessageSchema: z.ZodObject<{
    correlationId: z.ZodString;
    enqueuedAt: z.ZodString;
    messageType: z.ZodLiteral<"polling-trigger">;
    mspTenantId: z.ZodString;
    workflowId: z.ZodString;
    triggerId: z.ZodString;
    connectionId: z.ZodString;
    checkpointPartitionKey: z.ZodString;
    checkpointRowKey: z.ZodString;
}, z.core.$strip>;
export declare const deadLetterReviewQueueMessageSchema: z.ZodObject<{
    correlationId: z.ZodString;
    enqueuedAt: z.ZodString;
    messageType: z.ZodLiteral<"dead-letter-review">;
    sourceQueue: z.ZodEnum<{
        "workflow-start": "workflow-start";
        "workflow-step": "workflow-step";
        "ai-agent-step": "ai-agent-step";
        "management-operation": "management-operation";
        "technician-context-refresh": "technician-context-refresh";
        "directory-sync-refresh": "directory-sync-refresh";
        "standards-evaluation": "standards-evaluation";
        "polling-trigger": "polling-trigger";
        "dead-letter-review": "dead-letter-review";
    }>;
    executionId: z.ZodOptional<z.ZodString>;
    stepId: z.ZodOptional<z.ZodString>;
    failureCount: z.ZodNumber;
    diagnosticBlobPath: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const queueMessageSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    correlationId: z.ZodString;
    enqueuedAt: z.ZodString;
    messageType: z.ZodLiteral<"workflow-start">;
    executionId: z.ZodString;
    mspTenantId: z.ZodString;
    workflowId: z.ZodString;
    workflowVersionId: z.ZodString;
    clientTenantId: z.ZodOptional<z.ZodString>;
    triggerId: z.ZodOptional<z.ZodString>;
    triggerType: z.ZodEnum<{
        manual: "manual";
        schedule: "schedule";
        webhook: "webhook";
        polling: "polling";
        queue: "queue";
    }>;
    inputBlobPath: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    correlationId: z.ZodString;
    enqueuedAt: z.ZodString;
    messageType: z.ZodLiteral<"workflow-step">;
    executionId: z.ZodString;
    stepId: z.ZodString;
    stepIndex: z.ZodNumber;
    attempt: z.ZodNumber;
    mspTenantId: z.ZodString;
    workflowId: z.ZodString;
    workflowVersionId: z.ZodString;
    clientTenantId: z.ZodOptional<z.ZodString>;
    resumeFromNodeId: z.ZodString;
    contextBlobPath: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    correlationId: z.ZodString;
    enqueuedAt: z.ZodString;
    messageType: z.ZodLiteral<"ai-agent-step">;
    aiAgentRunId: z.ZodString;
    executionId: z.ZodString;
    executionStepId: z.ZodString;
    mspTenantId: z.ZodString;
    workflowId: z.ZodString;
    workflowVersionId: z.ZodString;
    clientTenantId: z.ZodOptional<z.ZodString>;
    agentId: z.ZodString;
    agentVersionId: z.ZodString;
    foundryProjectRef: z.ZodString;
    inputBlobPath: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    correlationId: z.ZodString;
    enqueuedAt: z.ZodString;
    messageType: z.ZodLiteral<"management-operation">;
    operationId: z.ZodString;
    mspTenantId: z.ZodString;
    clientTenantId: z.ZodString;
    operationType: z.ZodString;
    authMode: z.ZodEnum<{
        "gdap-obo": "gdap-obo";
        "platform-app": "platform-app";
        delegated: "delegated";
        custom: "custom";
    }>;
    connectionId: z.ZodOptional<z.ZodString>;
    requestedByType: z.ZodEnum<{
        user: "user";
        workflow: "workflow";
        system: "system";
        "user-or-workflow": "user-or-workflow";
        "user-or-system": "user-or-system";
    }>;
    requestedById: z.ZodString;
    requestBlobPath: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    correlationId: z.ZodString;
    enqueuedAt: z.ZodString;
    messageType: z.ZodLiteral<"technician-context-refresh">;
    mspTenantId: z.ZodString;
    contextType: z.ZodEnum<{
        user: "user";
        workflow: "workflow";
        tenant: "tenant";
        ticket: "ticket";
        device: "device";
        documentation: "documentation";
        alert: "alert";
    }>;
    contextId: z.ZodString;
    sourceSystem: z.ZodString;
    requestedByType: z.ZodEnum<{
        user: "user";
        workflow: "workflow";
        system: "system";
        "user-or-workflow": "user-or-workflow";
        "user-or-system": "user-or-system";
    }>;
    requestedById: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    correlationId: z.ZodString;
    enqueuedAt: z.ZodString;
    messageType: z.ZodLiteral<"directory-sync-refresh">;
    mspTenantId: z.ZodString;
    clientTenantId: z.ZodString;
    datasetName: z.ZodString;
    authMode: z.ZodEnum<{
        "gdap-obo": "gdap-obo";
        "platform-app": "platform-app";
        delegated: "delegated";
        custom: "custom";
    }>;
    requestedByType: z.ZodEnum<{
        user: "user";
        workflow: "workflow";
        system: "system";
        "user-or-workflow": "user-or-workflow";
        "user-or-system": "user-or-system";
    }>;
    requestedById: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    correlationId: z.ZodString;
    enqueuedAt: z.ZodString;
    messageType: z.ZodLiteral<"standards-evaluation">;
    mspTenantId: z.ZodString;
    targetType: z.ZodEnum<{
        tenant: "tenant";
        "tenant-group": "tenant-group";
    }>;
    targetId: z.ZodString;
    standardId: z.ZodString;
    requestedByType: z.ZodEnum<{
        user: "user";
        workflow: "workflow";
        system: "system";
        "user-or-workflow": "user-or-workflow";
        "user-or-system": "user-or-system";
    }>;
    requestedById: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    correlationId: z.ZodString;
    enqueuedAt: z.ZodString;
    messageType: z.ZodLiteral<"polling-trigger">;
    mspTenantId: z.ZodString;
    workflowId: z.ZodString;
    triggerId: z.ZodString;
    connectionId: z.ZodString;
    checkpointPartitionKey: z.ZodString;
    checkpointRowKey: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    correlationId: z.ZodString;
    enqueuedAt: z.ZodString;
    messageType: z.ZodLiteral<"dead-letter-review">;
    sourceQueue: z.ZodEnum<{
        "workflow-start": "workflow-start";
        "workflow-step": "workflow-step";
        "ai-agent-step": "ai-agent-step";
        "management-operation": "management-operation";
        "technician-context-refresh": "technician-context-refresh";
        "directory-sync-refresh": "directory-sync-refresh";
        "standards-evaluation": "standards-evaluation";
        "polling-trigger": "polling-trigger";
        "dead-letter-review": "dead-letter-review";
    }>;
    executionId: z.ZodOptional<z.ZodString>;
    stepId: z.ZodOptional<z.ZodString>;
    failureCount: z.ZodNumber;
    diagnosticBlobPath: z.ZodOptional<z.ZodString>;
}, z.core.$strip>], "messageType">;
export declare function parseWorkflowDocument(input: unknown): {
    schemaVersion: number;
    workflowId: string;
    displayName: string;
    trigger: {
        type: "manual" | "schedule" | "webhook" | "polling" | "queue";
        config: Record<string, unknown>;
    };
    nodes: ({
        id: string;
        label: string;
        type: "trigger";
        triggerType: "manual" | "schedule" | "webhook" | "polling" | "queue";
        config: Record<string, unknown>;
        position?: {
            x: number;
            y: number;
        } | undefined;
        disabled?: boolean | undefined;
    } | {
        id: string;
        label: string;
        type: "connector-action";
        connectorId: string;
        connectorVersionId: string;
        actionId: string;
        connectionId: string;
        inputs: Record<string, unknown>;
        position?: {
            x: number;
            y: number;
        } | undefined;
        disabled?: boolean | undefined;
        outputs?: Record<string, string> | undefined;
    } | {
        id: string;
        label: string;
        type: "condition";
        expression: string;
        position?: {
            x: number;
            y: number;
        } | undefined;
        disabled?: boolean | undefined;
    } | {
        id: string;
        label: string;
        type: "loop";
        collectionExpression: string;
        itemVariable: string;
        position?: {
            x: number;
            y: number;
        } | undefined;
        disabled?: boolean | undefined;
    } | {
        id: string;
        label: string;
        type: "data-transform";
        transform: string | Record<string, unknown>;
        position?: {
            x: number;
            y: number;
        } | undefined;
        disabled?: boolean | undefined;
    } | {
        id: string;
        label: string;
        type: "variable";
        variableName: string;
        position?: {
            x: number;
            y: number;
        } | undefined;
        disabled?: boolean | undefined;
        valueExpression?: string | undefined;
    } | {
        id: string;
        label: string;
        type: "javascript";
        position?: {
            x: number;
            y: number;
        } | undefined;
        disabled?: boolean | undefined;
        inlineScript?: string | undefined;
        scriptBlobPath?: string | undefined;
        inputBindings?: Record<string, unknown> | undefined;
        outputBindings?: Record<string, string> | undefined;
        timeoutSeconds?: number | undefined;
    } | {
        id: string;
        label: string;
        type: "ai-agent";
        agentId: string;
        agentVersionId: string;
        foundryProjectRef: string;
        operatingMode: "suggest-only" | "act-with-tools" | "approval-required";
        inputTemplate: Record<string, unknown>;
        outputSchema: Record<string, unknown>;
        approvalPolicy: {
            required: boolean;
            approverRoles?: string[] | undefined;
            timeoutSeconds?: number | undefined;
        };
        timeoutSeconds: number;
        maxRetries: number;
        position?: {
            x: number;
            y: number;
        } | undefined;
        disabled?: boolean | undefined;
        toolPolicyRef?: string | undefined;
    })[];
    edges: {
        id: string;
        sourceNodeId: string;
        targetNodeId: string;
        sourcePort?: string | undefined;
        targetPort?: string | undefined;
        label?: string | undefined;
        conditionExpression?: string | undefined;
    }[];
    variables: {
        id: string;
        name: string;
        type: "string" | "number" | "boolean" | "object" | "unknown" | "array";
        initialValue?: unknown;
    }[];
    bindings: {
        connections: {
            connectionId: string;
            connectorId?: string | undefined;
            alias?: string | undefined;
            scopeType?: "msp" | "client" | undefined;
            requiredActions?: string[] | undefined;
        }[];
    };
    ai: {
        draftSource: "manual" | "ai" | "manual-or-ai";
        designSessionId?: string | null | undefined;
        assumptions?: string[] | undefined;
    };
    editor: {
        viewport: Record<string, unknown>;
        selectedNodeIds?: string[] | undefined;
        sidebarState?: Record<string, unknown> | undefined;
    };
    workflowVersionId?: string | null | undefined;
};
export declare function parseManagementOperationDocument(input: unknown): {
    operationId: string;
    operationType: string;
    mspTenantId: string;
    clientTenantId: string;
    authMode: "gdap-obo" | "platform-app" | "delegated" | "custom";
    target: {
        [x: string]: unknown;
        userId?: string | undefined;
        groupId?: string | undefined;
        roleId?: string | undefined;
        deviceId?: string | undefined;
        tenantId?: string | undefined;
    };
    parameters: Record<string, unknown>;
    approval: {
        required: boolean;
        approverRoles?: string[] | undefined;
        timeoutSeconds?: number | undefined;
    };
};
export declare function parseQueueMessage(input: unknown): {
    correlationId: string;
    enqueuedAt: string;
    messageType: "workflow-start";
    executionId: string;
    mspTenantId: string;
    workflowId: string;
    workflowVersionId: string;
    triggerType: "manual" | "schedule" | "webhook" | "polling" | "queue";
    clientTenantId?: string | undefined;
    triggerId?: string | undefined;
    inputBlobPath?: string | undefined;
} | {
    correlationId: string;
    enqueuedAt: string;
    messageType: "workflow-step";
    executionId: string;
    stepId: string;
    stepIndex: number;
    attempt: number;
    mspTenantId: string;
    workflowId: string;
    workflowVersionId: string;
    resumeFromNodeId: string;
    clientTenantId?: string | undefined;
    contextBlobPath?: string | undefined;
} | {
    correlationId: string;
    enqueuedAt: string;
    messageType: "ai-agent-step";
    aiAgentRunId: string;
    executionId: string;
    executionStepId: string;
    mspTenantId: string;
    workflowId: string;
    workflowVersionId: string;
    agentId: string;
    agentVersionId: string;
    foundryProjectRef: string;
    clientTenantId?: string | undefined;
    inputBlobPath?: string | undefined;
} | {
    correlationId: string;
    enqueuedAt: string;
    messageType: "management-operation";
    operationId: string;
    mspTenantId: string;
    clientTenantId: string;
    operationType: string;
    authMode: "gdap-obo" | "platform-app" | "delegated" | "custom";
    requestedByType: "user" | "workflow" | "system" | "user-or-workflow" | "user-or-system";
    requestedById: string;
    requestBlobPath: string;
    connectionId?: string | undefined;
} | {
    correlationId: string;
    enqueuedAt: string;
    messageType: "technician-context-refresh";
    mspTenantId: string;
    contextType: "user" | "workflow" | "tenant" | "ticket" | "device" | "documentation" | "alert";
    contextId: string;
    sourceSystem: string;
    requestedByType: "user" | "workflow" | "system" | "user-or-workflow" | "user-or-system";
    requestedById: string;
} | {
    correlationId: string;
    enqueuedAt: string;
    messageType: "directory-sync-refresh";
    mspTenantId: string;
    clientTenantId: string;
    datasetName: string;
    authMode: "gdap-obo" | "platform-app" | "delegated" | "custom";
    requestedByType: "user" | "workflow" | "system" | "user-or-workflow" | "user-or-system";
    requestedById: string;
} | {
    correlationId: string;
    enqueuedAt: string;
    messageType: "standards-evaluation";
    mspTenantId: string;
    targetType: "tenant" | "tenant-group";
    targetId: string;
    standardId: string;
    requestedByType: "user" | "workflow" | "system" | "user-or-workflow" | "user-or-system";
    requestedById: string;
} | {
    correlationId: string;
    enqueuedAt: string;
    messageType: "polling-trigger";
    mspTenantId: string;
    workflowId: string;
    triggerId: string;
    connectionId: string;
    checkpointPartitionKey: string;
    checkpointRowKey: string;
} | {
    correlationId: string;
    enqueuedAt: string;
    messageType: "dead-letter-review";
    sourceQueue: "workflow-start" | "workflow-step" | "ai-agent-step" | "management-operation" | "technician-context-refresh" | "directory-sync-refresh" | "standards-evaluation" | "polling-trigger" | "dead-letter-review";
    failureCount: number;
    executionId?: string | undefined;
    stepId?: string | undefined;
    diagnosticBlobPath?: string | undefined;
};
export declare function parseKeyVaultSecretPayload(input: unknown): {
    authType: "custom" | "oauth2-client-credentials" | "oauth2-authorization-code" | "oauth2-on-behalf-of" | "api-key" | "basic-auth" | "certificate";
    clientId?: string | undefined;
    clientSecret?: string | undefined;
    tokenUrl?: string | undefined;
    scopes?: string[] | undefined;
    username?: string | undefined;
    password?: string | undefined;
    apiKey?: string | undefined;
    headers?: Record<string, string> | undefined;
};
//# sourceMappingURL=schemas.d.ts.map
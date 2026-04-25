/**
 * MCP Bridge Utility
 * Facilitates communication between the React UI and the Agno/MCP backend substrate.
 * PHI_CONSTANT: 0.113
 */

export interface MCPCallRequest {
    server_command: string;
    server_args: string[];
    task: string;
}

export interface MCPCallResponse {
    status: 'success' | 'error';
    result?: string;
    message?: string;
}

/**
 * Invokes an MCP tool through the backend bridge.
 * @param serverCommand The command to start the MCP server (e.g., 'npx', 'python')
 * @param serverArgs Arguments for the command (e.g., ['-y', '@modelcontextprotocol/server-everything'])
 * @param task The natural language task for the agent to execute using the tool
 */
export const callMCPTool = async (
    serverCommand: string,
    serverArgs: string[],
    task: string
): Promise<MCPCallResponse> => {
    try {
        const response = await fetch('/api/mcp/call', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                server_command: serverCommand,
                server_args: serverArgs,
                task: task,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('[MCP_BRIDGE_ERROR]', error);
        return {
            status: 'error',
            message: error instanceof Error ? error.message : String(error),
        };
    }
};

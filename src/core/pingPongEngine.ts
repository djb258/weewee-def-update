export type AgentType = 'A' | 'B';

export interface PromptVersion {
  version: string;
  agent: AgentType;
  prompt: string;
  source: string;
  json: StampedJson;
  timestamp: string;
}

export interface StampedJson {
  S: string;
  T: string;
  A: string;
  M: string;
  P: string;
  E: string;
  D: string;
}

export interface PingPongEngineOptions {
  initialPrompt: string;
  initialAgent?: AgentType;
}

/**
 * PingPongEngine manages the state and logic for ping-pong prompt refinement.
 * It is UI-agnostic and can be integrated into any frontend or workflow.
 */
export class PingPongEngine {
  private history: PromptVersion[] = [];
  private agentTurn: AgentType;
  private goTriggered: boolean = false;

  constructor(private options: PingPongEngineOptions) {
    this.agentTurn = options.initialAgent || 'A';
    this.addVersion(options.initialPrompt, this.agentTurn, 'No external source — user input only');
    this.agentTurn = this.agentTurn === 'A' ? 'B' : 'A';
  }

  /**
   * Returns the current working prompt.
   */
  getCurrentPrompt(): string {
    return this.history[this.history.length - 1].prompt;
  }

  /**
   * Returns the full version history.
   */
  getHistory(): PromptVersion[] {
    return this.history;
  }

  /**
   * Returns the current agent's turn.
   */
  getAgentTurn(): AgentType {
    return this.agentTurn;
  }

  /**
   * Returns true if GO (final research) has been triggered.
   */
  isGoTriggered(): boolean {
    return this.goTriggered;
  }

  /**
   * Add a new version to the history.
   */
  private addVersion(prompt: string, agent: AgentType, source: string) {
    const version = `v${this.history.length + 1}_${agent}`;
    const json = this.makeStampedJson(version, agent, prompt, source);
    this.history.push({
      version,
      agent,
      prompt,
      source,
      json,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Simulate agent refinement (replace with real logic as needed).
   */
  refine(agent: AgentType) {
    if (this.goTriggered) return;
    const prev = this.history[this.history.length - 1];
    let refined = prev.prompt;
    if (agent === 'A') {
      refined = prev.prompt.trim().replace(/\s+/g, ' ');
    } else {
      refined = prev.prompt + ' (Consider edge cases and ambiguity.)';
    }
    const source = `Prior prompt version (${prev.version})`;
    this.addVersion(refined, agent, source);
    this.agentTurn = agent === 'A' ? 'B' : 'A';
  }

  /**
   * Apply a manual edit to the current prompt.
   */
  applyManualEdit(newPrompt: string) {
    if (this.goTriggered) return;
    const source = `Manual edit from ${this.history[this.history.length - 1].version}`;
    this.addVersion(newPrompt, this.agentTurn, source);
    this.agentTurn = this.agentTurn === 'A' ? 'B' : 'A';
  }

  /**
   * Jump to a prior version (returns the prompt).
   */
  jumpToVersion(version: string): string | undefined {
    const v = this.history.find((h) => h.version === version);
    if (v) {
      return v.prompt;
    }
    return undefined;
  }

  /**
   * Trigger GO (final research phase).
   */
  triggerGo() {
    this.goTriggered = true;
  }

  /**
   * Get the current version object.
   */
  getCurrentVersion(): PromptVersion {
    return this.history[this.history.length - 1];
  }

  /**
   * Utility to create STAMPED/SPVPET/STACKED JSON.
   */
  private makeStampedJson(version: string, agent: AgentType, prompt: string, source: string): StampedJson {
    return {
      S: 'ping_pong_prompt_refinement',
      T: 'prompt_versioning',
      A: agent === 'A' ? 'Agent A' : 'Agent B',
      M: version,
      P: prompt,
      E: source,
      D: new Date().toISOString(),
    };
  }
} 
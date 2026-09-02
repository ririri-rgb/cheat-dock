export interface DeferredSearchCommit {
  generation: number;
  value: string;
}

export class ImeAwareSearchInput {
  private composing = false;
  private generation = 0;

  compositionStart(): void {
    this.composing = true;
    this.generation += 1;
  }

  input(value: string, eventIsComposing = false): string | null {
    if (this.composing || eventIsComposing) return null;
    this.generation += 1;
    return value;
  }

  compositionEnd(value: string): DeferredSearchCommit {
    this.composing = false;
    this.generation += 1;
    return { generation: this.generation, value };
  }

  canCommitDeferred(commit: DeferredSearchCommit): boolean {
    return !this.composing && commit.generation === this.generation;
  }

  isComposing(): boolean {
    return this.composing;
  }
}

import { type FormEvent } from "react";
import type { ModelInfo, PublicConfig } from "../lib/types";
import { ModelSelector } from "./ModelSelector";

interface Props {
	models: ModelInfo[];
	config: PublicConfig | null;
	model: string;
	systemPrompt: string;
	message: string;
	temperature: number;
	loading: boolean;
	onModel: (v: string) => void;
	onSystemPrompt: (v: string) => void;
	onMessage: (v: string) => void;
	onTemperature: (v: number) => void;
	onSubmit: () => void;
}

export function ChatForm(props: Props) {
	const { config, message, loading } = props;
	const maxLen = config?.maxMessageLength ?? 8000;
	const tempRange = config?.temperature ?? { min: 0, max: 2, default: 0.4 };
	const canSubmit = message.trim().length > 0 && !loading;

	function handleSubmit(e: FormEvent) {
		e.preventDefault();
		if (canSubmit) props.onSubmit();
	}

	return (
		<form className="chat-form" onSubmit={handleSubmit}>
			<ModelSelector
				models={props.models}
				value={props.model}
				onChange={props.onModel}
				disabled={loading}
			/>

			<label className="field">
				<span className="field-label">System prompt (optional)</span>
				<textarea
					rows={2}
					placeholder="You are a helpful DevOps assistant."
					value={props.systemPrompt}
					onChange={(e) => props.onSystemPrompt(e.target.value)}
					disabled={loading}
					aria-label="system prompt"
				/>
			</label>

			<label className="field">
				<span className="field-label">
					Message{" "}
					<small className="field-hint">
						{message.length}/{maxLen}
					</small>
				</span>
				<textarea
					rows={5}
					placeholder="Explain a rollout strategy for a risky deploy."
					value={message}
					maxLength={maxLen}
					onChange={(e) => props.onMessage(e.target.value)}
					disabled={loading}
					aria-label="message"
					required
				/>
			</label>

			<label className="field">
				<span className="field-label">
					Temperature{" "}
					<small className="field-hint">{props.temperature.toFixed(2)}</small>
				</span>
				<input
					type="range"
					min={tempRange.min}
					max={tempRange.max}
					step={0.05}
					value={props.temperature}
					onChange={(e) => props.onTemperature(Number(e.target.value))}
					disabled={loading}
					aria-label="temperature"
				/>
			</label>

			<button type="submit" className="primary" disabled={!canSubmit}>
				{loading ? "Generating…" : "Send to gateway"}
			</button>
		</form>
	);
}

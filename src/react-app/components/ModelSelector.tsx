import type { ModelInfo } from "../lib/types";

interface Props {
	models: ModelInfo[];
	value: string;
	onChange: (id: string) => void;
	disabled?: boolean;
}

export function ModelSelector({ models, value, onChange, disabled }: Props) {
	const selected = models.find((m) => m.id === value);
	return (
		<label className="field">
			<span className="field-label">Model</span>
			<select
				value={value}
				onChange={(e) => onChange(e.target.value)}
				disabled={disabled || models.length === 0}
				aria-label="model"
			>
				{models.map((m) => (
					<option key={m.id} value={m.id}>
						{m.label}
					</option>
				))}
			</select>
			{selected && <small className="field-hint">{selected.description}</small>}
		</label>
	);
}

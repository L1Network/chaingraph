import type { createChaingraphClient } from "..";

export type ChaingraphClient = ReturnType<typeof createChaingraphClient>;

export type GraphQLSdkProps = {
	config?: RequestInit;
	jwt?: string;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	options?: any; // TODO: improve type
	url?: string;
	apiKey: string;
};

import type { EosioReaderTableRow } from "@blockmatic/eosio-ship-reader";
import omit from "lodash.omit";
import { config } from "../config";
import { logger } from "../lib/logger";
import type { MappingsReader } from "../mappings";
import type { ChainGraphTableRow, ChainGraphTableWhitelist } from "../types";

export const getPrimaryKey = (
	row: EosioReaderTableRow,
	mappingsReader: MappingsReader,
): string => {
	// biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
	let tableMappings;
	try {
		// find table mappings
		tableMappings = mappingsReader.mappings
			.find((m) => m.contract === row.code)
			.tables.find((t) => t.table === row.table);

		if (!tableMappings) {
			throw new Error(`TableMapping not found for row ${JSON.stringify(row)}`);
		}

		if (tableMappings.table_type === "singleton") return "singleton";

		let primary_key;
		switch (tableMappings.computed_key_type) {
			case "proposal_creator_id":
				primary_key = `proposal_${row.value.creator}_${row.value.proposal_id}`;
				break;
			case "asset_symbol":
				primary_key = row.value[tableMappings.table_key].split(" ")[1];
				break;
			case "symbol":
				primary_key = row.value[tableMappings.table_key].split(",")[1];
				break;
			case "extended_asset_symbol":
				primary_key =
					row.table === "stablev2"
						? `balance_${
								row.value[tableMappings.table_key].quantity.split(" ")[1]
							}`
						: row.value[tableMappings.table_key].quantity.split(" ")[1];
				break;
			default:
				primary_key = row.value[tableMappings.table_key];
				break;
		}

		return String(primary_key) !== "[object Object]" ? String(primary_key) : "";
	} catch (error) {
		logger.warn({ row, tableMappings });
		if (error instanceof Error) logger.error(error);
		// process.exit(1)
	}
};

export const getChainGraphTableRowData = (
	row: EosioReaderTableRow,
	mappingsReader: MappingsReader,
): ChainGraphTableRow => {
	const normalizedScope = row.scope.toString().normalize().replace(/"/g, "");
	return {
		...omit(row, "value", "code", "present", "primary_key"),
		scope: normalizedScope,
		primary_key: getPrimaryKey(row, mappingsReader),
		data: row.value,
		contract: row.code,
		chain: config.reader.chain,
	};
};

import type {IConnector, IConnectorUpdate, IGuideline, IGuidelineStringRules, IRule} from "../royalCore"
import Utils from "./Utils"

export default class Royal {
	private _connector: IConnector
	private _sync: boolean

	constructor(connector: IConnector) {
		if (!connector) throw new TypeError("Connector is undefined")

		this._connector = connector
		this._sync = this._connector.constructor.name == "SyncConnector"
	}

	private _getRules4Guideline(id: string, findGuideline?: string[]): IRule[]
	private _getRules4Guideline(id: string, findGuideline?: string[]): Promise<IRule[]>
	private _getRules4Guideline(id: string, findGuideline: string[] = []): Promise<IRule[]> | IRule[] {
		try {
			if (findGuideline.includes(id)) return []
			findGuideline.push(id)

			if (this._sync) {
				const guideline: IGuideline = this._connectorFunc("get", id)
				return Utils.rulesCompact([
					...(guideline?.guidelines || []).map((r): IRule[] => this._getRules4Guideline(r, findGuideline)).flat(),
					...(guideline?.rules || []),
				])
			}
			return new Promise<IRule[]>(async (res) => {
				const guideline: IGuideline = await this._connectorFunc("get", id)
				const rules = await Promise.all((guideline?.guidelines || []).map(async (r) => await this._getRules4Guideline(r, findGuideline)))
				res(Utils.rulesCompact([...rules.flat(), ...(guideline?.rules || [])]))
			})
		} catch (error) {
			return []
		}
	}

	canGuideline(id: string, rule: string | IRule): boolean
	canGuideline(id: string, rule: string | IRule): Promise<boolean>
	canGuideline(id: string, rule: string | IRule): boolean | Promise<boolean> {
		if (this._sync) {
			return Utils.canRules(this._getRules4Guideline(id), rule)
		}
		return new Promise<boolean>(async (res) => {
			res(Utils.canRules(await this._getRules4Guideline(id), rule))
		})
	}

	addGuideline(id: string, data: IGuidelineStringRules = {}): void {
		if (!id) throw new Error("id is empty")
		const {guidelines, payload, rules, upGuideline} = data
		return this._connectorFunc(
			"add",
			id,
			guidelines || [],
			payload,
			(rules || []).map((e) => Utils.string2Rule(e)),
			upGuideline || [],
		)
	}

	getGuidelineRules(id: string): IRule[] {
		return this._getRules4Guideline(id)
	}

	getGuidelines(): IGuideline[] {
		return this._connectorFunc("getAll")
	}

	getGuideline(id: string): IGuideline {
		return this._connectorFunc("get", id)
	}

	removeGuideline(id: string): void {
		return this._connectorFunc("remove", id)
	}

	updateGuideline(id: string, controller: IConnectorUpdate): void {
		return this._connectorFunc("update", id, controller)
	}

	_connectorFunc(func: "getAll", ...args: any[]): IGuideline[]
	_connectorFunc(func: "get", ...args: any[]): IGuideline
	_connectorFunc(func: "add" | "remove" | "update", ...args: any[]): void
	_connectorFunc(func: "add" | "getAll" | "get" | "remove" | "update", ...args: any[]): any {
		try {
			if (this._sync) {
				// @ts-ignore
				return this._connector[func](...args)
			}
			return new Promise(async (res, rej) => {
				try {
					// @ts-ignore
					res(await this._connector[func](...args))
				} catch (error) {
					rej(error)
				}
			})
		} catch (error) {
			throw error
		}
	}
}

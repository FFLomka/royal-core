import type {IConnector, IConnectorUpdate, IGuideline, IRule} from "../royalCore"
import Utils from "./Utils"

export default class SyncConnector implements IConnector {
	private data: IGuideline[]

	constructor(data: IGuideline[] = []) {
		this.data = data
	}

	getAll() {
		return this.data
	}

	get(id: string) {
		return this.data.find((f) => f.id == id)
	}
	add(id: string, guidelines: string[], payload: any, rules: IRule[], upGuideline: string[]): void {
		if (this.data.find((f) => f.id == id)) throw new Error("Guideline is exists")

		const doc = {
			id,
			guidelines,
			payload,
			rules,
			upGuideline,
		}

		this.data.push(doc)
	}

	remove(id: string) {
		const i = this.data.findIndex((f) => f.id == id)
		if (i == -1) throw new Error("Guideline is not exists")
		return this.data.splice(i, 1)[0]
	}

	update(id: string, controller: IConnectorUpdate) {
		const {addRules = [], removeRules = [], addGuidelines = [], removeGuidelines = [], addUpGuidelines = [], removeUpGuidelines = [], payload} = controller

		const guideline = this.data.find((f) => f.id == id)

		if (!guideline) return

		removeRules.forEach((rule) => {
			const i = (guideline.rules || []).findIndex((f) => Utils.Rule2string(f) == rule)
			if (i == -1) return
			guideline.rules.splice(i, 1)
		})
		removeGuidelines.forEach((e) => {
			const i = (guideline.guidelines || []).findIndex((f) => f == e)
			if (i == -1) return
			guideline.guidelines.splice(i, 1)
		})
		removeUpGuidelines.forEach((upGuideline) => {
			const i = (guideline.upGuideline || []).findIndex((f) => f == upGuideline)
			if (i == -1) return
			guideline.upGuideline.splice(i, 1)
		})

		guideline.rules = [...guideline.rules, ...addRules.map((e) => Utils.string2Rule(e))]
		guideline.guidelines = [...guideline.guidelines, ...addGuidelines]
		guideline.upGuideline = [...guideline.upGuideline, ...addUpGuidelines]
		guideline.payload = payload ? payload : guideline.payload
	}
}

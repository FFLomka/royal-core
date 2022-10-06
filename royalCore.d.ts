export declare type GuidLine = string

export declare interface IRule {
	exception?: boolean
	_v0: string
	_v1?: string
	_v2?: string
	_v3?: string
	_v4?: string
	_v5?: string
	_v6?: string
	_v7?: string
	_v8?: string
	_v9?: string
}

export declare interface IGuidelineWithoutId {
	guidelines: GuidLine[]
	payload?: any
	rules: IRule[]
	upGuideline: GuidLine[]
}

export declare interface IGuidelineStringRules {
	guidelines?: GuidLine[]
	payload?: any
	rules?: string[]
	upGuideline?: GuidLine[]
}

export declare interface IGuideline extends IGuidelineWithoutId {
	id: string
}

export declare interface IConnector {
	getAll(): IGuideline[]
	get(id: string): IGuideline | undefined
	add(id: string, guidelines: GuidLine[], payload: any, rules: IRule[], upGuideline: GuidLine[]): void
	remove(id: string): void
	update(id: string, controller: IConnectorUpdate): void
}

export declare interface IConnectorAsync {
	getAll(): Promise<IGuideline[]>
	get(id: string): Promise<IGuideline | undefined>
	add(id: string, guidelines: GuidLine[], payload: any, rules: IRule[], upGuideline: GuidLine[]): Promise<void>
	remove(id: string): Promise<void>
	update(id: string, controller: IConnectorUpdate): Promise<void>
}

export declare interface IConnectorUpdate {
	addRules?: string[]
	removeRules?: string[]
	addGuidelines?: string[]
	removeGuidelines?: string[]
	addUpGuidelines?: string[]
	removeUpGuidelines?: string[]
	payload?: any
}

export declare class Royal {
	canGuideline(id: string, rule: string | IRule): boolean
	canGuideline(id: string, rule: string | IRule): Promise<boolean>
	canGuideline(id: string, rule: string | IRule): boolean | Promise<boolean>

	addGuideline(id: string, data: IGuidelineStringRules = {}): void

	getGuidelineRules(id: string): IRule[]

	getGuidelines(): IGuideline[]

	getGuideline(id: string): IGuideline

	removeGuideline(id: string): void

	updateGuideline(id: string, controller: IConnectorUpdate): void
}
export declare class SyncConnector {}
export declare class Utils {}

export {}


const __void = "void";

export enum NodeFlags {
	abstract = 1,
}

export class ASTNode {
	name: string;
	flags: number;

	constructor( name: string ) {
		this.name = name;
		this.flags = 0;
	}
}

export class ASTSource extends ASTNode {
	code: string;
}

export class ASTClass extends ASTNode {
	ctor: ASTFunc;
	children: ASTFunc[];
	ext: string;

	constructor( name: string ) {
		super( name );
		this.children = [];
	}
}

export class ASTFunc extends ASTNode {
	params: ASTParam[];
	type: string;
	source: string;

	constructor( name: string ) {
		super( name );
		this.params = [];
		this.type = __void;
	}
}

export class ASTParam extends ASTNode {
	type: string;

	constructor( name: string, type: string ) {
		super( name );
		this.type = type;
	}
}

export 
abstract class Generator {
	abstract generate( basename: string, ast: ASTNode[] ): void;
}

export function _trim( x: string ) {
	return x[0]=='\t' ? x.substring( 1 ) : x;
}

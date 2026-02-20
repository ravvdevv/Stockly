export namespace main {
	
	export class Category {
	    id: string;
	    name: string;
	    description: string;
	    createdAt: string;
	
	    static createFrom(source: any = {}) {
	        return new Category(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.createdAt = source["createdAt"];
	    }
	}
	export class Product {
	    id: string;
	    name: string;
	    sku: string;
	    category: string;
	    price: number;
	    stock: number;
	    createdAt: string;
	
	    static createFrom(source: any = {}) {
	        return new Product(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.sku = source["sku"];
	        this.category = source["category"];
	        this.price = source["price"];
	        this.stock = source["stock"];
	        this.createdAt = source["createdAt"];
	    }
	}
	export class SaleItem {
	    productId: string;
	    productName: string;
	    quantity: number;
	    price: number;
	
	    static createFrom(source: any = {}) {
	        return new SaleItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.productId = source["productId"];
	        this.productName = source["productName"];
	        this.quantity = source["quantity"];
	        this.price = source["price"];
	    }
	}
	export class Sale {
	    id: string;
	    items: SaleItem[];
	    subtotal: number;
	    tax: number;
	    taxRate: number;
	    total: number;
	    paymentMethod: string;
	    amountTendered: number;
	    change: number;
	    createdAt: string;
	
	    static createFrom(source: any = {}) {
	        return new Sale(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.items = this.convertValues(source["items"], SaleItem);
	        this.subtotal = source["subtotal"];
	        this.tax = source["tax"];
	        this.taxRate = source["taxRate"];
	        this.total = source["total"];
	        this.paymentMethod = source["paymentMethod"];
	        this.amountTendered = source["amountTendered"];
	        this.change = source["change"];
	        this.createdAt = source["createdAt"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}


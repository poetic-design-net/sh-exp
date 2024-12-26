export async function createProduct(data) {
    const response = await fetch("/api/products", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error("Failed to create product");
    }
    return response.json();
}
export async function updateProduct(id, data) {
    const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error("Failed to update product");
    }
    return response.json();
}
export async function getProducts() {
    const response = await fetch("/api/products");
    if (!response.ok) {
        throw new Error("Failed to fetch products");
    }
    return response.json();
}
export async function getProductBySlug(slug) {
    const response = await fetch(`/api/products/slug/${slug}`);
    if (!response.ok) {
        if (response.status === 404)
            return null;
        throw new Error("Failed to fetch product");
    }
    return response.json();
}
export async function deleteProduct(id) {
    const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) {
        throw new Error("Failed to delete product");
    }
}

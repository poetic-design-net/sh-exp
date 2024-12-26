export async function createCategory(data) {
    const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create category");
    }
    return response.json();
}
export async function updateCategory(id, data) {
    const response = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update category");
    }
    return response.json();
}
export async function deleteCategory(id) {
    const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete category");
    }
}
export async function getCategories() {
    const response = await fetch("/api/categories");
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch categories");
    }
    return response.json();
}
export async function getCategory(id) {
    const response = await fetch(`/api/categories/${id}`);
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch category");
    }
    return response.json();
}

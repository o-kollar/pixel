import PocketBase from "pocketbase";

const pb = new PocketBase("http://127.0.0.1:8090");

export async function createUser(userData) {
  try {
    const user = await pb.collection("users").create({
      email: userData.email,
      password: userData.password,
      passwordConfirm: userData.passwordConfirm,
      name: userData.name,
    });
   
    console.log("User created:", user);
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user");
  }
}

export async function loginUser(loginData) {
  try {
    // Attempt to log in with email and password
    const authData = await pb.collection("users").authWithPassword(
      loginData.email,
      loginData.password
    );
    console.log("User logged in:", authData);
    return authData;
  } catch (error) {
    console.error("Error logging in:", error);
    throw new Error("Failed to login user");
  }
}

export async function checkAuth(token) {
  try {
    const response = await pb.send('/api/collections/users/auth-refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const user = response.record;
    console.log("Authenticated user:", user);
    return { authenticated: true, user };
  } catch (error) {
    console.error("Error checking authentication:", error);
    return { authenticated: false };
  }
}

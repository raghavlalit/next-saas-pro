import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { redirect } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { ChangePasswordForm } from "@/components/settings/change-password-form"
import { ProfileForm } from "@/components/settings/profile-form"

export default async function SettingsPage() {
    const session = await auth();
    const userEmail = session?.user?.email;

    if (!userEmail) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { email: userEmail }
    });



    async function deleteAccount() {
        "use server";
        if (!userEmail) return;
        await prisma.user.delete({
            where: { email: userEmail }
        });
        redirect("/login");
    }

    return (
        <div className="space-y-6">
            <Breadcrumb />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Settings
            </h1>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Appearance</h2>
                <div className="mt-4">
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Customize how the app looks on your device.</p>
                    <ModeToggle />
                </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Profile Information</h2>
                {user && <ProfileForm user={user} />}
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Change Password</h2>
                <div className="mt-4">
                     <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">Ensure your account is secure by using a strong password.</p>
                     <ChangePasswordForm />
                </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
                <h2 className="text-lg font-medium text-red-600 dark:text-red-400">Danger Zone</h2>
                <div className="mt-4">
                    <form action={deleteAccount}>
                        <button className="rounded-md border border-red-600 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:bg-gray-800 dark:hover:bg-gray-700">
                            Delete Account
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}


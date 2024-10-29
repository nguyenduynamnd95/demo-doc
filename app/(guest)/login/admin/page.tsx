import { Button } from "@/components/ui/button";
import Image from "next/image";
import CompositeAlert from "@/components/ui/composite-alert";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { loginAsAdmin } from "@/services/server/kintone";
import { redirect } from "next/navigation";

export default function AdminLogin({ searchParams }: {
	searchParams: { [key: string]: string | string[] | undefined }
}) {
	const t = useTranslations('login')
	const errorMap: { [key: string]: string } = {
		'access_denied': t('errorAccessDenied'),
	}

	async function login(formData: FormData) {
		'use server'
		const res = await loginAsAdmin(formData.get('usn') as string ?? '', formData.get('pwd') as string ?? '')
		if (res)
			redirect('/')
		else
			redirect(`/login/admin?error=access_denied`)
	}

	return <>
		<div className="h-dvh flex justify-center items-center">
			<div className="flex flex-col w-80 max-w-full gap-2 p-3">
				<Image src="/images/logo.png" alt={"logo"} className="self-center" width={200}
				       height={1}/>
				<h1 className="text-center mb-10 text-2xl">{process.env.NEXT_PUBLIC_APP_NAME}</h1>

				{searchParams?.error ? (
					<CompositeAlert status="error" successDescription={() => ''}
					                errorDescription={() => errorMap[searchParams.error as string]}/>
				) : ''}
				<form action={login} className="gap-1 flex flex-col">
					<Input placeholder={t('username')} name="usn"/>
					<Input placeholder={t('password')} name="pwd" type="password"/>
					<Button type="submit" size="lg" className="w-full">{t('loginWithKintone')}</Button>
				</form>
			</div>
		</div>
	</>
}

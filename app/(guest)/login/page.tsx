import { Button } from "@/components/ui/button";
import { Spinner } from '@/components/ui/spinner';
import Link from "next/link";
import Image from "next/image";

import { Input } from "@/components/ui/input";
import { loginAsAdmin } from "@/services/server/kintone"; 
import CompositeAlert from "@/components/ui/composite-alert";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function Login({ searchParams }: {
	searchParams: { [key: string]: string | string[] | undefined }
}) {
	const t = await getTranslations('login')
	const errorMap: { [key: string]: string } = {
		'access_denied': t('errorAccessDenied'),
	}
	async function login(formData: FormData) {
		'use server'
		const res = await loginAsAdmin(formData.get('usn') as string ?? '', formData.get('pwd') as string ?? '');
		if (res)
			redirect('/')
		else
			redirect(`/login?error=access_denied`)
	}

	return <>
		<div className="h-dvh flex justify-center items-center bg-[#FFFFFF]">
			<div className="flex flex-col w-[500px] px-[50px] py-[30px]
				max-w-full gap-2 p-3 bg-[#FFFFFF] shadow-lg boder rounded">
				<Image src="/images/logo.png" alt={"logo"} className="self-center" width={200}
					height={1} />
				<h1 className="text-center mb-10 text-2xl">{process.env.NEXT_PUBLIC_APP_NAME}</h1>

				{searchParams?.error ? (
					<CompositeAlert status="error" successDescription={() => ''}
						errorDescription={() => errorMap[searchParams.error as string]} />
				) : ''}
				<form action={login} className="gap-1 flex flex-col">
					<label className="text-[#666666] font-sans">Username</label>
					<Input placeholder={t('username')} className="font-sans" name="usn" />
					<label className="text-[#666666] font-sans mt-[15px]">Password</label>
					<Input placeholder={t('password')} className="font-sans" name="pwd" type="password" />
					<Button type="submit" size="lg" className="w-full bg-[#D71518] hover:bg-[#D71518] mt-[20px]">
						Login
					</Button>

				</form>
			</div>
		</div>
	</>
}

// 'use client';

// import { useForm, useFormState } from 'react-hook-form';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { useTranslations } from 'next-intl';
// import Image from "next/image";
// import { Button } from "@/components/ui/button";
// import CompositeAlert from "@/components/ui/composite-alert";
// import { Input } from "@/components/ui/input";
// import { useLogin } from '@/services/client/login';
// import { useGetNotes } from '@/services/client/document';

// type FormData = {
// 	usn: string;
// 	pwd: string;
// };

// export default function AdminLogin() {
// 	const t = useTranslations('login');
// 	const searchParams = useSearchParams();

// 	const errorMap: { [key: string]: string } = {
// 		'access_denied': t('errorAccessDenied'),
// 	};

// 	const { register, handleSubmit, control } = useForm<FormData>();
// 	const { isSubmitting } = useFormState({ control });
// 	const loginMutation = useLogin();

// 	const onSubmit = (data: FormData) => {
// 		loginMutation.mutate(data);
// 	};
	

// 	return (
// 		<div className="h-dvh flex justify-center items-center bg-[#FFFFFF]">
// 			<div className="flex flex-col w-[500px] px-[50px] py-[30px]
// 				max-w-full gap-2 p-3 bg-[#FFFFFF] shadow-lg boder rounded">
// 				<Image src="/images/logo.png" alt={"logo"} className="self-center" width={200}
// 					height={1} />
// 				<h1 className="text-center mb-10 text-2xl">{process.env.NEXT_PUBLIC_APP_NAME}</h1>

// 				{searchParams.get('error') ? (
// 					<CompositeAlert
// 						status="error"
// 						successDescription={() => ''}
// 						errorDescription={() => errorMap[searchParams.get('error') as string]}
// 					/>
// 				) : null}
// 				<form onSubmit={handleSubmit(onSubmit)} className="gap-1 flex flex-col">
// 					<label className="text-[#666666] font-sans">Username</label>
// 					<Input placeholder={t('username')} className="font-sans" {...register('usn')} />
// 					<label className="text-[#666666] font-sans mt-[15px]">Password</label>
// 					<Input placeholder={t('password')} className="font-sans" {...register('pwd')} type="password" />
// 					<Button type="submit" size="lg" className="w-full bg-[#D71518] hover:bg-[#D71518] mt-[20px]" disabled={isSubmitting}>
// 						{isSubmitting ? 'Submitting...' : 'Login'}
// 					</Button>

// 				</form>
// 			</div>
// 		</div>
// 	);
// }

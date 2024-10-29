import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { ReactElement } from "react";

export default function CompositeAlert({ className, status, successDescription, errorDescription, }: {
	className?: string,
	status: "error" | "success" | "idle" | "pending"
	successDescription: () => string,
	errorDescription: () => string,
}) {
	const t = useTranslations('alert')
	type Config = {
		variant: 'default' | 'destructive' | 'success'
		title: string
		description: string
		icon: ({ className }: { className?: string }) => ReactElement
	}
	const config: Config | undefined = status === 'success'
		? {
			variant: "success",
			title: t('success'),
			description: successDescription(),
			icon: ({ className }: { className?: string }) => <CheckCircle className={className}/>,
		} as Config
		: status === 'error'
			? {
				variant: "destructive",
				title: t('error'),
				description: errorDescription(),
				icon: ({ className }: { className?: string }) => <AlertCircle className={className}/>,
			} as Config
			: undefined

	if (!config)
		return ''

	return (
		<Alert className={className} variant={config.variant}>
			<config.icon className="h-4 w-4"/>
			<AlertTitle>{config.title}</AlertTitle>
			<AlertDescription>
				{config.description}
			</AlertDescription>
		</Alert>
	)
}

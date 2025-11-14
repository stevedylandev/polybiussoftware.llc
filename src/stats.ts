import { $ } from "bun";

export async function getSystemStats() {
	const stats: Record<string, string> = {};

	try {
		// OS Name
		const osName = await $`uname -s`.text();
		stats.os = osName.trim();
		const isLinux = stats.os === "Linux";

		// OS Version
		const osVersion = await $`uname -r`.text();
		stats.version = osVersion.trim();

		// Architecture
		const arch = await $`uname -m`.text();
		stats.arch = arch.trim();

		// Uptime
		if (isLinux) {
			const uptimeData = await $`cat /proc/uptime`.text();
			const uptimeSeconds = Math.floor(
				Number.parseFloat(uptimeData.split(" ")[0]),
			);
			const days = Math.floor(uptimeSeconds / 86400);
			const hours = Math.floor((uptimeSeconds % 86400) / 3600);
			const minutes = Math.floor((uptimeSeconds % 3600) / 60);
			stats.uptime = `${days}d ${hours}h ${minutes}m`;
		} else {
			const uptimeSeconds = await $`sysctl -n kern.boottime`.text();
			const bootMatch = uptimeSeconds.match(/sec = (\d+)/);
			if (bootMatch) {
				const bootTime = Number.parseInt(bootMatch[1]);
				const now = Math.floor(Date.now() / 1000);
				const uptime = now - bootTime;
				const days = Math.floor(uptime / 86400);
				const hours = Math.floor((uptime % 86400) / 3600);
				const minutes = Math.floor((uptime % 3600) / 60);
				stats.uptime = `${days}d ${hours}h ${minutes}m`;
			}
		}

		// CPU Info
		if (isLinux) {
			const cpuInfo = await $`grep "model name" /proc/cpuinfo`.text();
			const firstCpu = cpuInfo.split("\n")[0];
			const cpuBrand = firstCpu.split(":")[1]?.trim() || "Unknown";
			stats.cpu = cpuBrand;
		} else {
			const cpuBrand = await $`sysctl -n machdep.cpu.brand_string`.text();
			stats.cpu = cpuBrand.trim();
		}

		// CPU Cores
		if (isLinux) {
			const cpuCores = await $`nproc`.text();
			stats.cores = cpuCores.trim();
		} else {
			const cpuCores = await $`sysctl -n hw.ncpu`.text();
			stats.cores = cpuCores.trim();
		}

		// Memory
		if (isLinux) {
			const memInfo = await $`grep MemTotal /proc/meminfo`.text();
			const memKB = Number.parseInt(memInfo.split(/\s+/)[1]);
			const memGB = (memKB / 1024 / 1024).toFixed(1);
			stats.memory = `${memGB} GB`;
		} else {
			const memBytes = await $`sysctl -n hw.memsize`.text();
			const memGB = (
				Number.parseInt(memBytes.trim()) /
				1024 /
				1024 /
				1024
			).toFixed(1);
			stats.memory = `${memGB} GB`;
		}

		// Shell
		const shell = process.env.SHELL || "unknown";
		stats.shell = shell.split("/").pop() || shell;

		// Bun version
		const bunVersion = Bun.version;
		stats.bun = bunVersion;
	} catch (error) {
		console.error("Error fetching system stats:", error);
	}

	return stats;
}

export function formatStats(stats: Record<string, string>): string {
	const labels: Record<string, string> = {
		os: "OS",
		version: "Kernel",
		arch: "Arch",
		uptime: "Uptime",
		cpu: "CPU",
		cores: "Cores",
		memory: "Memory",
		shell: "Shell",
		bun: "Bun",
	};

	// Calculate the actual content width
	const maxLabelLength = Math.max(
		...Object.values(labels).map((l) => l.length),
	);
	const maxValueLength = Math.max(...Object.values(stats).map((v) => v.length));

	const headerText = "message made possible thanks to";
	// Content width: "  LABEL : VALUE  " (2 spaces + label + space + colon + space + value + 2 spaces)
	const contentWidth = 2 + maxLabelLength + 3 + maxValueLength + 2;
	const boxWidth = Math.max(contentWidth, headerText.length + 4);

	const lines: string[] = [];
	lines.push(`         ╭${"─".repeat(boxWidth)}╮`);

	// Center the header
	const headerPadding = Math.floor((boxWidth - headerText.length) / 2);
	const headerRightPadding = boxWidth - headerPadding - headerText.length;
	lines.push(
		`         │${" ".repeat(headerPadding)}${headerText}${" ".repeat(headerRightPadding)}│`,
	);
	lines.push(`         ├${"─".repeat(boxWidth)}┤`);

	// Add stats rows
	for (const [key, value] of Object.entries(stats)) {
		const label = labels[key] || key;
		const paddedLabel = label.padEnd(maxLabelLength);
		const paddedValue = value.padEnd(maxValueLength);
		const content = `  ${paddedLabel} : ${paddedValue}  `;
		const rightPadding = boxWidth - content.length;
		lines.push(`         │${content}${" ".repeat(rightPadding)}│`);
	}

	lines.push(`         ╰${"─".repeat(boxWidth)}╯`);

	return lines.join("\n");
}

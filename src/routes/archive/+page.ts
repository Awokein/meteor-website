import type { PageLoad } from "./$types"
import { fetchStats } from "$lib/stats"
import { parse, SemVer } from "semver"

export const load: PageLoad = async ({ fetch }) => {
    const stats = await fetchStats(fetch)
    const builds = []

    let latest = parseVersion("0.0.0")!

    for (const str in stats.builds) {
        const version = parseVersion(str)!
        if (version.compare(latest) > 0) latest = version
    }

    for (const str in stats.builds) {
        const version = parseVersion(str)!
        const number = stats.builds[str]

        if (version.compare(latest) != 0) {
            builds.push({
                version,
                number,
            })
        }
    }

    builds.sort((a, b) => -a.version.compare(b.version))

    return {
        builds: groupBy(builds, build => build.version.major + "." + build.version.minor),
    }
}

function parseVersion(str: string): SemVer | null {
    while (str.split(".").length < 3) {
        str += ".0"
    }

    return parse(str)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function groupBy<T>(arr: T[], fn: (item: T) => any) {
    return arr.reduce<Record<string, T[]>>((prev, curr) => {
        const groupKey = fn(curr)
        const group = prev[groupKey] || []
        group.push(curr)
        return { ...prev, [groupKey]: group }
    }, {})
}

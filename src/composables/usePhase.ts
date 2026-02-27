/**
 * usePhase - 工厂期数 composable
 * 根据当前路由前缀 /pv (一期) 或 /es (二期) 判断工厂期数
 * 各页面可据此生成不同的模拟数据
 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'

export interface PhaseInfo {
    /** 当前期数：1 或 2 */
    phase: number
    /** 期数标签：'一期' 或 '二期' */
    label: string
    /** 工厂全称 */
    factoryName: string
    /** 路由前缀 */
    prefix: string
    /** 用于产生差异化模拟数据的随机种子偏移 */
    seedOffset: number
}

export function usePhase() {
    const route = useRoute()

    /** 当前路由是否属于二期 */
    const isPhase2 = computed(() => route.path.startsWith('/es'))

    /** 当前期数信息 */
    const phaseInfo = computed<PhaseInfo>(() => {
        if (isPhase2.value) {
            return {
                phase: 2,
                label: '二期',
                factoryName: '鹤问湖水质净化厂（二期）',
                prefix: '/es',
                seedOffset: 1000, // 二期数据偏移量，使 mock 数据不同
            }
        }
        return {
            phase: 1,
            label: '一期',
            factoryName: '鹤问湖水质净化厂（一期）',
            prefix: '/pv',
            seedOffset: 0,
        }
    })

    /**
     * 根据期数生成不同范围的随机数
     * 二期数据区间整体偏移，模拟不同工厂差异
     */
    const phaseRandInt = (min: number, max: number): number => {
        const offset = isPhase2.value ? Math.floor((max - min) * 0.3) : 0
        return Math.floor(Math.random() * (max - min + 1)) + min + offset
    }

    /**
     * 获取当前期数的路由前缀路径
     * 用于各页面内部的 router-link 路径适配
     */
    const resolvePath = (subPath: string): string => {
        const prefix = isPhase2.value ? '/es' : '/pv'
        return `${prefix}/${subPath}`
    }

    return {
        isPhase2,
        phaseInfo,
        phaseRandInt,
        resolvePath,
    }
}

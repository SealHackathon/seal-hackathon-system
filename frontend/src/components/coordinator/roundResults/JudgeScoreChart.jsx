import ReactECharts from 'echarts-for-react'
import { useMemo } from 'react'

/**
 * JudgeScoreChart — Individual Value Plot (scatter + mean line + std dev band)
 * Mỗi tiêu chí là 1 nhóm nằm ngang trên cùng 1 chart.
 * Hiển thị: dot từng BGK, mean line, ±1σ band, highlight BGK gửi, proposed score.
 *
 * Props:
 *   criteria       : Array<{ id, name, weight }>
 *   judges         : Array<{ id, name, isSender, scores, proposedScores? }>
 *   affectedId     : string  — id tiêu chí bị yêu cầu chỉnh
 */
function JudgeScoreChart({ criteria, judges, affectedId }) {
  const option = useMemo(() => {
    // Tính toán thống kê cho từng tiêu chí
    const stats = criteria.map((c) => {
      const allScores = judges.map((j) => j.scores[c.id]).filter(Boolean)
      const n = allScores.length
      const mean = allScores.reduce((a, b) => a + b, 0) / n
      const variance = allScores.reduce((s, x) => s + Math.pow(x - mean, 2), 0) / n
      const sigma = Math.sqrt(variance)
      return { ...c, mean, sigma, min: mean - sigma, max: mean + sigma }
    })

    // Y-axis: tên tiêu chí (đảo ngược để tiêu chí đầu ở trên)
    const yAxisData = [...stats].reverse().map((s) => s.name)

    // --- Series 1: Band ±1σ (custom bar mờ) ---
    const bandSeries = {
      name: '±1σ',
      type: 'custom',
      renderItem(params, api) {
        const yIdx = params.dataIndex
        const statItem = [...stats].reverse()[yIdx]
        const xMin = api.coord([statItem.min, yIdx])
        const xMax = api.coord([statItem.max, yIdx])
        const barHeight = 24
        return {
          type: 'rect',
          shape: {
            x: xMin[0],
            y: xMin[1] - barHeight / 2,
            width: xMax[0] - xMin[0],
            height: barHeight,
            // Bo góc cho band ±1σ
            r: 6,
          },
          style: {
            fill: 'rgba(8, 76, 221, 0.07)',
            stroke: '#C0D5FF',
            lineWidth: 1,
          },
        }
      },
      // Dữ liệu chỉ cần index để renderItem đọc stats
      data: stats.map((_, i) => [0, i]),
      z: 1,
      emphasis: { disabled: true },
      tooltip: {
        formatter: (p) => {
          const yIdx = p.data[1]
          const statItem = [...stats].reverse()[yIdx]
          return `Khoảng ±1σ: <b>${statItem.min.toFixed(2)}</b> - <b>${statItem.max.toFixed(2)}</b>`
        },
      },
    }

    // --- Series 2: Mean line (scatter dọc hình tròn dẹt) ---
    const meanSeries = {
      name: 'Trung bình',
      type: 'scatter',
      symbolSize: [2, 40],
      symbol: 'rect',
      itemStyle: { color: 'var(--color-primary-blue)' },
      emphasis: { disabled: true },
      data: [...stats].reverse().map((s, i) => ({
        value: [s.mean, i],
        name: s.name,
      })),
      z: 2,
      tooltip: {
        formatter: (p) => `Trung bình: <b>${p.value[0].toFixed(2)}</b>`,
      },
    }

    // --- Series 3: Điểm các BGK thường (dot) ---
    const normalDotData = []
    judges
      .filter((j) => !j.isSender)
      .forEach((j) => {
        ;[...stats].reverse().forEach((s, yIdx) => {
          const score = j.scores[s.id]
          if (score !== undefined) {
            normalDotData.push({
              value: [score, yIdx],
              name: j.name,
              judge: j.name,
            })
          }
        })
      })

    const normalSeries = {
      name: 'Điểm BGK',
      type: 'scatter',
      symbolSize: 10,
      itemStyle: { color: '#C0D5FF' },
      data: normalDotData,
      z: 3,
      tooltip: {
        formatter: (p) => `${p.data.judge}: <b>${p.value[0]}</b>`,
      },
    }

    // --- Series 4: Điểm BGK gửi (highlighted) ---
    const sender = judges.find((j) => j.isSender)
    const senderCurrentData = sender
      ? [...stats].reverse().map((s, yIdx) => ({
          value: [sender.scores[s.id], yIdx],
          name: sender.name,
          criteriaId: s.id,
        }))
      : []

    const senderSeries = {
      name: sender?.name ?? 'BGK gửi',
      type: 'scatter',
      symbolSize: (_, params) => {
        const d = senderCurrentData[params.dataIndex]
        // Tiêu chí bị chỉnh: to hơn
        return d?.criteriaId === affectedId ? 16 : 12
      },
      itemStyle: {
        color: '#084CDD',
      },
      data: senderCurrentData,
      z: 4,
      tooltip: {
        formatter: (p) => `${sender?.name}: <b>${p.value[0]}</b> (hiện tại)`,
      },
    }

    // --- Series 5: Điểm đề xuất (outline dot, chỉ tiêu chí bị chỉnh) ---
    const proposedData = []
    if (sender?.proposedScores) {
      ;[...stats].reverse().forEach((s, yIdx) => {
        const proposed = sender.proposedScores?.[s.id]
        if (proposed !== undefined) {
          proposedData.push({
            value: [proposed, yIdx],
            criteriaId: s.id,
          })
        }
      })
    }

    const proposedSeries = {
      name: 'Đề xuất',
      type: 'scatter',
      symbolSize: 16,
      symbol: 'circle',
      itemStyle: {
        // Nền trắng, viền dashed primary blue
        color: '#ffffff',
        borderColor: '#084CDD',
        borderWidth: 1.5,
        borderType: 'dashed',
      },
      data: proposedData,
      z: 5,
      tooltip: {
        formatter: (p) => `Đề xuất: <b>${p.value[0]}</b>`,
      },
    }

    return {
      animation: false,
      grid: {
        left: 16,
        right: 24,
        top: 8,
        bottom: 8,
        containLabel: true,
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: '#fff',
        borderColor: '#C0D5FF',
        borderWidth: 1,
        textStyle: { color: '#343330', fontSize: 12 },
        padding: [6, 10],
        extraCssText: 'box-shadow: none;',
      },
      xAxis: {
        type: 'value',
        min: 0,
        max: 10,
        interval: 2,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: {
          lineStyle: { color: '#C0D5FF', type: 'dashed' },
        },
        axisLabel: {
          color: '#7799E3',
          fontSize: 11,
          formatter: (v) => (v === 0 || v === 10 || v % 2 === 0 ? v : ''),
        },
      },
      yAxis: {
        type: 'category',
        data: yAxisData,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#7799E3',
          fontSize: 12,
          rich: {
            highlight: {
              color: '#084CDD',
              fontWeight: 'bold',
            },
          },
          // Highlight tiêu chí bị chỉnh
          formatter: (name) => {
            const s = stats.find((x) => x.name === name)
            return s?.id === affectedId ? `{highlight|${name}}` : name
          },
        },
      },
      series: [
        bandSeries,
        meanSeries,
        normalSeries,
        senderSeries,
        proposedSeries,
      ],
    }
  }, [criteria, judges, affectedId])

  // Chiều cao tự động theo số tiêu chí
  const chartHeight = Math.max(criteria.length * 56 + 32, 160)

  return (
    <ReactECharts
      option={option}
      style={{ height: chartHeight, width: '100%' }}
      opts={{ renderer: 'svg' }}
    />
  )
}

export default JudgeScoreChart

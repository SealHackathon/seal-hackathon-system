/**
 * Dữ liệu Vị trí trong đội — dùng cho MultiSelectDropdown ở Step 4
 */

export const MAX_POSITIONS = 3

/**
 * options truyền vào MultiSelectDropdown (format grouped)
 * section → items[]
 */
export const positionOptions = [
    {
        section: 'Vị trí phổ biến',
        items: [
            { value: 'backend',  label: 'Backend'           },
            { value: 'frontend', label: 'Frontend'          },
            { value: 'uiux',     label: 'UI/UX Designer'    },
            { value: 'mobile',   label: 'Mobile Developer'  },
            { value: 'devops',   label: 'DevOps / Cloud'    },
            { value: 'ai_ml',    label: 'AI / ML Engineer'  },
            { value: 'tester',   label: 'Tester / QA'       },
            { value: 'ba',       label: 'Business Analyst'  },
        ],
    },
]

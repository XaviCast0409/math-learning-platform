export const RewardsTable = () => {
    const rewards = [
        { time: '5 min', xp: '~150', gems: '25', highlight: false },
        { time: '10 min', xp: '~300', gems: '50', highlight: false },
        { time: '20 min', xp: '~800', gems: '200', highlight: true },
        { time: '30 min', xp: '~1100', gems: '250', highlight: false },
    ];

    return (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 border-2 border-blue-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">💎</span>
                <h3 className="font-black text-gray-800">Tabla de Recompensas</h3>
            </div>

            <div className="bg-white rounded-xl overflow-hidden border border-blue-100">
                <table className="w-full text-sm">
                    <thead className="bg-blue-100">
                        <tr>
                            <th className="text-left py-2 px-3 font-bold text-gray-700">Tiempo</th>
                            <th className="text-right py-2 px-3 font-bold text-gray-700">XP</th>
                            <th className="text-right py-2 px-3 font-bold text-gray-700">Gemas</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rewards.map((r, idx) => (
                            <tr
                                key={r.time}
                                className={`
                  ${r.highlight ? 'bg-yellow-100 font-bold' : idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                  ${r.highlight ? 'border-l-4 border-yellow-500' : ''}
                `}
                            >
                                <td className="py-2.5 px-3 flex items-center gap-2">
                                    {r.time}
                                    {r.highlight && <span className="text-xs">⭐</span>}
                                </td>
                                <td className="text-right py-2.5 px-3">{r.xp}</td>
                                <td className="text-right py-2.5 px-3">{r.gems}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                <p className="text-xs text-yellow-800 text-center font-medium">
                    ⭐ <strong>¡Estudia 20 minutos para el bonus especial!</strong>
                </p>
                <p className="text-[10px] text-yellow-700 text-center mt-1">
                    +200 XP extra + 100 💎 extra al llegar a 20 minutos
                </p>
            </div>
        </div>
    );
};

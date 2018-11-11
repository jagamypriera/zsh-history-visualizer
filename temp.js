<Table style={{tableLayout:"fixed"}}>
<TableHead>
    <TableRow>
    <TableCell style={{width:"40%"}}>Base Command</TableCell>
    <TableCell style={{width:"50%"}}>Complete Command</TableCell>
    <TableCell style={{width:"10%"}}>Hour</TableCell>
    </TableRow>
</TableHead>
<TableBody>
    {data&&data.map((row,index) => {
    return (
        <TableRow key={index} >
        <TableCell style={{whiteSpace: 'normal',wordWrap: 'break-word'}}>{row.base_command}</TableCell>
        <TableCell style={{whiteSpace: 'normal',wordWrap: 'break-word'}}>{row.command}</TableCell>
        <TableCell style={{whiteSpace: 'normal',wordWrap: 'break-word'}}>{row.hour}</TableCell>
        </TableRow>
    );
    })}
</TableBody>
</Table>
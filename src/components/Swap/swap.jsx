import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Popover from '@material-ui/core/Popover';
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import PopOverButton from "../Buttons/popOverButton";
import axios from "axios";


const useStyles = makeStyles((theme) => ({
  paper: {
    border: "1px solid",
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
  },
  root: {
    minWidth: 275,
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)",
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
}));

export default function Swap(props) {
  const classes = useStyles();

  const [ethToken, setEthToken] = React.useState([]);
  const [polygonToken, setPolygonToken] = React.useState([]);
  
  const componentDidMount = async () => {
    if (props.user) {
      let loadingData = await Promise.all([
        axios.get("https://api.1inch.exchange/v3.0/1/tokens"),
        axios.get("https://api.1inch.exchange/v3.0/137/tokens"),])
      
      setEthToken(Object.values(loadingData[0].data.tokens));
      setPolygonToken(Object.values(loadingData[1].data.tokens));
    } //else {
    //}
  };

  useEffect(() => {
    if (ethToken.length === 0) {
      //component did mount
      componentDidMount();
    } else {
      //component did update
    }
  });

  return (
    <Card className={classes.root}>
      <CardContent>
      <div>
      <PopOverButton title="Token on Ethereum" tokens={ethToken}/>
      <PopOverButton title="Token on Polygon" tokens={polygonToken}/>
    </div>
    <div>
      <PopOverButton title="Token on Ethereum" tokens={ethToken}/>
      <PopOverButton title="Token on Polygon" tokens={polygonToken}/>
    </div>
      </CardContent>
    </Card>
  );
}

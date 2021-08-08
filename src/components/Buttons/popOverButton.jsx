import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Popover from "@material-ui/core/Popover";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import styled from "styled-components";


const Img = styled.img`
  width: 35px;
  height: 35px;
`;

const useStyles = makeStyles((theme) => ({
  typography: {
    padding: theme.spacing(2),
  },
}));

export default function PopOverButton(props) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [buttonText, setButtonText] = React.useState({img: "", title: props.title});

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleTokenChoice = (token) => {
    props.tokenChoice(token);
    console.log(token.logoURI);
    console.log(token);
    setButtonText({img: token.logoURI, title: token.symbol});
  };


  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const sortedList = props.tokens.sort((a, b) => (a.symbol > b.symbol) ? 1 : -1);

  const listItems = sortedList.map((token) => (
    <ul key={token.address}><button onClick={() => handleTokenChoice(token)}><Img src = {token.logoURI}/>{token.symbol}</button></ul>
  ));

  return (
    <>
      <Button
        aria-describedby={id}
        variant="contained"
        color="primary"
        onClick={handleClick}
        style={{maxWidth: '250px', maxHeight: '50px', minWidth: '250px', minHeight: '50px'}}
      >
        {buttonText.img != "" ? <Img src = {buttonText.img} /> : null}
        {buttonText.title}
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        onClick={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <Typography className={classes.typography} component={'span'} variant={'body2'}>
            {listItems}     
        </Typography>
      </Popover>
    </>
  );
}
